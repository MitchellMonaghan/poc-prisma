import { SchemaDirectiveVisitor } from 'graphql-tools'
import { AuthenticationError, ApolloError } from 'apollo-server'
import { find } from 'lodash'
import { permissionAccessLevelValuesEnum } from '@modules/permission/manager'
import { isRootObject } from './directiveHelper'

class requiresPermission extends SchemaDirectiveVisitor {
  visitObject (objectType) {
    const fields = objectType.getFields()

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName]
      this.requiresPermission(field)
    })
  }

  visitFieldDefinition (field, details) {
    this.requiresPermission(field)
  }

  requiresPermission (field) {
    const { resolve } = field

    field.resolve = async (...args) => {
      const [parent, , context, field] = args

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

        if (isRootObject(parentTypeName)) {
          return resolve ? resolve.apply(this, args) : parent
        } else {
          return parent[field.fieldName]
        }
      }
    }
  }
}

module.exports = requiresPermission
export default requiresPermission
