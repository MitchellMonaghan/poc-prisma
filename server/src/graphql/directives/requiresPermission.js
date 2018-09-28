import { SchemaDirectiveVisitor } from 'graphql-tools'
import { AuthenticationError, ApolloError } from 'apollo-server'
import { find } from 'lodash'
import { permissionAccessLevelEnum } from '@modules/permission/manager'

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
      const { user } = context

      if (!user) {
        throw new AuthenticationError('Token invalid please authenticate.')
      }

      const permissionTypeRequired = this.args.permission
      const accessLevelRequired = permissionAccessLevelEnum[this.args.accessLevel].value

      const usersPermission = find(user.permissions, { accessType: permissionTypeRequired })
      const usersPermissionAccessLevel = permissionAccessLevelEnum[usersPermission.accessLevel].value

      if (usersPermissionAccessLevel < accessLevelRequired) {
        throw new ApolloError('You do not have the sufficient permissions to do that.', '403', { status: 403 })
      } else {
        return resolve ? resolve.apply(this, args) : parent[field.fieldName]
      }
    }
  }
}

module.exports = requiresPermission
export default requiresPermission
