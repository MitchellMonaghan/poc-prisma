import { SchemaDirectiveVisitor } from 'graphql-tools'
import { AuthenticationError, ForbiddenError } from 'apollo-server'
import { permissionAccessLevelEnum, getPermisionAccessLevel } from '@modules/permission/manager'
import { errorText } from '@services/joi'

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
        throw new AuthenticationError(errorText.authenticationError())
      }

      const permissionTypeRequired = this.args.permission
      const accessLevelRequired = permissionAccessLevelEnum[this.args.accessLevel].value

      if (getPermisionAccessLevel(permissionTypeRequired, user) < accessLevelRequired) {
        throw new ForbiddenError(errorText.requiresPermission(field.fieldName, this.args.permission, this.args.accessLevel))
      } else {
        return resolve ? resolve.apply(this, args) : parent[field.fieldName]
      }
    }
  }
}

module.exports = requiresPermission
export default requiresPermission
