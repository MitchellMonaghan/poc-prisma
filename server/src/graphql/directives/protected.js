import { SchemaDirectiveVisitor } from 'graphql-tools'
import { AuthenticationError, ForbiddenError } from 'apollo-server'
import { get } from 'lodash'
import { permissionAccessLevelEnum, getPermisionAccessLevel } from '@modules/permission/manager'
import { isRootObject } from './directiveHelper'

import { errorText } from '@services/joi'

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
        throw new AuthenticationError(errorText.authenticationError())
      }

      const parentTypeName = field.parentType.name

      const entityReadPermission = `READ_${parentTypeName.toUpperCase()}`
      const permissionRequired = get(this, 'args.permission') ? this.args.permission : entityReadPermission

      const isOwner = await this.isOwner(...args)

      if (isOwner || getPermisionAccessLevel(permissionRequired, user) >= permissionAccessLevelEnum.ADMIN.value) {
        return resolve ? resolve.apply(this, args) : parent[field.fieldName]
      } else {
        throw new ForbiddenError(errorText.protectedFieldRead(field.fieldName))
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

    const createdBy = entityType === 'user' ? entity.id : entity.createdBy.id
    const isOwner = createdBy === user.id

    return isOwner
  }
}

module.exports = protectedField
export default protectedField
