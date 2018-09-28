import { SchemaDirectiveVisitor } from 'graphql-tools'
import { AuthenticationError } from 'apollo-server'
import { get, find } from 'lodash'
import { permissionAccessLevelValuesEnum } from '@modules/permission/manager'

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
        throw new AuthenticationError('Token invalid please authenticate.')
      }

      const parentTypeName = field.parentType.name
      const createdBy = parentTypeName.toLowerCase() === 'user' ? parent.id : parent.createdBy
      const isOwner = createdBy === user.id

      const entityReadPermission = `READ_${parentTypeName.toUpperCase()}`
      let permissionTypeRequired = get(this, 'args.permission') ? this.args.permission : entityReadPermission

      if (permissionTypeRequired !== entityReadPermission) {
        return resolve ? resolve.apply(this, args) : parent[field.fieldName]
      }

      const usersPermission = find(user.permissions, { accessType: permissionTypeRequired })
      const usersPermissionAccessLevel = permissionAccessLevelValuesEnum[usersPermission.accessLevel]

      if (usersPermissionAccessLevel === permissionAccessLevelValuesEnum.NONE) {
        throw new AuthenticationError('You do not have any access.')
      } else if (usersPermissionAccessLevel === permissionAccessLevelValuesEnum.OWNER && !isOwner) {
        throw new AuthenticationError('You are not the owner.')
      }

      return resolve ? resolve.apply(this, args) : parent[field.fieldName]
    }
  }
}

module.exports = usePermissions
export default usePermissions