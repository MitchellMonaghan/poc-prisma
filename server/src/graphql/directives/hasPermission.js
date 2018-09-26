import { SchemaDirectiveVisitor } from 'graphql-tools'
import { AuthenticationError, ApolloError } from 'apollo-server'
import { find } from 'lodash'
import { permissionAccessLevelValuesEnum } from '@modules/permission/manager'

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

    field.resolve = async (parent, args, context, field) => {
      if (!context.user) {
        throw new AuthenticationError('Token invalid please authenticate.')
      }

      const permissionTypeRequired = this.args.permission
      const accessLevelRequired = permissionAccessLevelValuesEnum[this.args.accessLevel]

      const usersPermission = find(context.user.permissions, { accessType: permissionTypeRequired })
      const usersPermissionAccessLevel = permissionAccessLevelValuesEnum[usersPermission.accessLevel]

      if (usersPermissionAccessLevel < accessLevelRequired) {
        throw new ApolloError('You do not have the sufficient permissions to do that.', '403', { status: 403 })
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
}

module.exports = hasPermission
export default hasPermission
