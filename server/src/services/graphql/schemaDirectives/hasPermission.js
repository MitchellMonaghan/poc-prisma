import { SchemaDirectiveVisitor } from 'graphql-tools'
import { AuthenticationError, UserInputError, ApolloError } from 'apollo-server'
import { permissionsEnum } from '@modules/auth/manager'

/*
import user from '@modules/user/model'

const models = {
  user
}
*/

const rootObjects = {
  query: 'Query',
  mutation: 'Mutation',
  subscription: 'Subscription'
}

class hasPermission extends SchemaDirectiveVisitor {
  visitObject (objectType, test) {
    objectType._isOwnerFieldsWrapped = true

    const fields = objectType.getFields()

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName]
      this.hasPermission(field)
    })
  }

  visitFieldDefinition (field, details) {
    this.hasPermission(field)
  }

  hasPermission (field) {
    const { resolve } = field

    field.resolve = async (...args) => {
      const [parent, , context, field] = args

      if (!context.user) {
        throw new AuthenticationError('Token invalid please authenticate.')
      }

      const userPermission = context.user.permissions[this.args.permission]
      const permissionRequired = permissionsEnum[this.args.value]

      if (userPermission < permissionRequired) {
        throw new ApolloError('You do not have the sufficient permissions to do that.', '403', { status: 403 })
      } else if (permissionRequired === permissionsEnum.owner && userPermission <= permissionsEnum.owner) {
        return this.isOwner(args, resolve)
      } else {
        const parentTypeName = field.parentType.name
        const isRootObject = parentTypeName === rootObjects.query || parentTypeName === rootObjects.mutation || parentTypeName === rootObjects.subscription

        if (isRootObject) {
          return resolve ? resolve.apply(this, args) : parent
        } else {
          return parent[field.fieldName]
        }
      }
    }
  }

  async isOwner (args, resolve) {
    const [parent, resolverArgs, context, field] = args

    let entity
    let createdBy
    let entityType
    const parentTypeName = field.parentType.name
    const isRootObject = parentTypeName === rootObjects.query || parentTypeName === rootObjects.mutation || parentTypeName === rootObjects.subscription

    if (isRootObject) {
      // if the directive is put on a query or mutation
      // determine the entity type by the input
      // entityType = this.args.permission.split('_')[1]
      // entity = parentTypeName === rootObjects.subscription ? parent : await models[entityType].findById(resolverArgs.id)
      // TODO: FIX BROKEN
      console.log(resolverArgs)
    } else {
      entityType = field.parentType.name.toLowerCase()

      entity = parent
    }

    createdBy = entity.createdBy

    if (entityType === 'user') {
      createdBy = entity.id
    }

    if (createdBy === context.user.id) {
      if (isRootObject) {
        return resolve ? resolve.apply(this, args) : entity
      } else {
        return parent[field.fieldName]
      }
    }

    if (field.parentType._isOwnerFieldsWrapped || isRootObject) {
      throw new UserInputError(`You are not the owner of that ${entityType}`, {
        invalidArgs: [
          'id'
        ]
      })
    } else {
      throw new UserInputError(`You do not have permission to access ${field.fieldName} on ${entityType}`, {
        invalidArgs: [
          field.fieldName
        ]
      })
    }
  }
}

module.exports = hasPermission
export default hasPermission
