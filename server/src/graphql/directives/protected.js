import { SchemaDirectiveVisitor } from 'graphql-tools'
import { AuthenticationError, ApolloError } from 'apollo-server'
import { get, find } from 'lodash'
import { permissionAccessLevelValuesEnum } from '@modules/permission/manager'
import { isRootObject } from './directiveHelper'

class protectedField extends SchemaDirectiveVisitor {
  visitObject (objectType) {
    const fields = objectType.getFields()

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName]
      this.protectedField(field)
    })
  }

  visitFieldDefinition (field, details) {
    this.protectedField(field)
  }

  protectedField (field) {
    const { resolve } = field

    field.resolve = async (...args) => {
      const [parent, , context, field] = args
      const { user } = context

      if (!user) {
        throw new AuthenticationError('Token invalid please authenticate.')
      }

      const parentTypeName = field.parentType.name

      const entityReadPermission = `READ_${parentTypeName.toUpperCase()}`
      const permissionRequired = get(this, 'args.permission') ? this.args.permission : entityReadPermission

      const usersPermission = find(user.permissions, { accessType: permissionRequired })
      const usersPermissionAccessLevel = permissionAccessLevelValuesEnum[usersPermission.accessLevel]

      const isOwner = await this.isOwner(...args)

      if (isOwner || usersPermissionAccessLevel >= permissionAccessLevelValuesEnum.ADMIN) {
        return resolve ? resolve.apply(this, args) : parent[field.fieldName]
      } else {
        throw new ApolloError('You do not have the sufficient permissions to do that.', '403', { status: 403 })
      }
    }
  }

  async isOwner (parent, requestArgs, context, field) {
    const { prisma, user } = context

    let entity
    let entityType
    const parentTypeName = field.parentType.name

    if (isRootObject(parentTypeName)) {
      // if the directive is put on a query or mutation
      // determine the entity type by the input
      entityType = this.args.permission.split('_')[1].toLowerCase()
      entity = await prisma.query[entityType]({
        where: { id: requestArgs.id }
      })
    } else {
      entityType = field.parentType.name.toLowerCase()
      entity = parent
    }

    const createdBy = entityType === 'user' ? entity.id : entity.createdBy
    const isOwner = createdBy === user.id

    return isOwner
  }
}

module.exports = protectedField
export default protectedField
