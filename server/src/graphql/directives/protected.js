import { SchemaDirectiveVisitor } from 'graphql-tools'
import { AuthenticationError, ApolloError } from 'apollo-server'
import { find } from 'lodash'
import { permissionAccessLevelValuesEnum } from '@modules/permission/manager'
import { isRootObject } from './directiveHelper'

class protectedField extends SchemaDirectiveVisitor {
  visitObject (objectType, test) {
    objectType._isOwnerFieldsWrapped = true

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
      const [parent, requestArgs, context, field] = args

      if (!context.user) {
        throw new AuthenticationError('Token invalid please authenticate.')
      }

      const parentTypeName = field.parentType.name
      const isARootObject = isRootObject(parentTypeName)

      // Protected read, write, or both. If not defined, both will be protected
      const permissionRequired = this.args.permission || `READ_${parentTypeName.toUpperCase()}`
      const usersPermission = find(context.user.permissions, { accessType: permissionRequired })
      const usersPermissionAccessLevel = permissionAccessLevelValuesEnum[usersPermission.accessLevel]

      const isOwner = await this.isOwner({ parent, requestArgs, context, field }, resolve)

      if (isOwner || usersPermissionAccessLevel >= permissionAccessLevelValuesEnum.ADMIN) {
        if (isARootObject) {
          return resolve ? resolve.apply(this, args) : parent
        } else {
          return parent[field.fieldName]
        }
      } else {
        throw new ApolloError('You do not have the sufficient permissions to do that.', '403', { status: 403 })
      }
    }
  }

  async isOwner ({ parent, requestArgs, context, field }, resolve) {
    const { prisma } = context

    let entity
    let createdBy
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

    createdBy = entity.createdBy

    if (entityType === 'user') {
      createdBy = entity.id
    }

    return createdBy === context.user.id
  }
}

const protectedUpdate = (createdBy, data, user, info) => {
  Object.keys(data).forEach((field) => {
    const entityType = info.returnType.name
    const entityUpdatePermissionName = `UPDATE_${entityType.toUpperCase()}`

    // Check for protected
    const protectedDirective = find(info.returnType._fields[field].astNode.directives, (directive) => {
      return directive.name.value === 'protected'
    })

    if (protectedDirective) {
      const updatePermissionSpecified = find(protectedDirective.arguments, (argument) => {
        return argument.value.value === entityUpdatePermissionName
      })

      if (protectedDirective.arguments.length === 0 || updatePermissionSpecified) {
        // Check if user has admin update or is owner
        const isOwner = createdBy === user.id
        const updatePermission = find(user.permissions, { accessType: entityUpdatePermissionName })
        const usersPermissionAccessLevel = permissionAccessLevelValuesEnum[updatePermission.accessLevel]

        if (!(isOwner || usersPermissionAccessLevel >= permissionAccessLevelValuesEnum.ADMIN)) {
          throw new ApolloError(`${field} is a protected field and can only be updated by the owner or admin access level.`, '403', { status: 403 })
        }
      }
    }
  })
}

const publicProps = {
  protectedField,
  protectedUpdate
}

module.exports = publicProps
export default publicProps
