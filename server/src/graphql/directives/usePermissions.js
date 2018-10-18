import { SchemaDirectiveVisitor } from 'graphql-tools'
import { AuthenticationError, ForbiddenError } from 'apollo-server'
import { get } from 'lodash'
import { permissionAccessLevelEnum, getPermisionAccessLevel } from '@modules/permission/manager'
import { errorText } from '@services/joi'

// TODO: Implement a resolver that will check the users permission to know if
// they are allow to read the data they are requesting
class usePermissions extends SchemaDirectiveVisitor {
  visitObject (objectType) {
    const fields = objectType.getFields()

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName]
      this.usePermissions(field)
    })
  }

  usePermissions (field) {
    const { resolve } = field

    field.resolve = async (...args) => {
      const [parent, , context, field] = args
      const { user } = context

      if (!user) {
        throw new AuthenticationError(errorText.authenticationError())
      }

      const parentTypeName = field.parentType.name
      const createdBy = parentTypeName.toLowerCase() === 'user' ? parent.id : parent.createdBy.id
      const isOwner = createdBy === user.id

      const entityReadPermission = `READ_${parentTypeName.toUpperCase()}`
      let permissionTypeRequired = get(this, 'args.permission') ? this.args.permission : entityReadPermission

      if (permissionTypeRequired !== entityReadPermission) {
        return resolve ? resolve.apply(this, args) : parent[field.fieldName]
      }

      const usersPermissionAccessLevel = getPermisionAccessLevel(permissionTypeRequired, user)

      if (usersPermissionAccessLevel === permissionAccessLevelEnum.NONE.value) {
        throw new ForbiddenError(errorText.noAccessRead(parentTypeName))
      } else if (usersPermissionAccessLevel === permissionAccessLevelEnum.OWNER.value && !isOwner) {
        throw new ForbiddenError(errorText.notOwnerRead(parentTypeName))
      }

      return resolve ? resolve.apply(this, args) : parent[field.fieldName]
    }
  }
}

module.exports = usePermissions
export default usePermissions
