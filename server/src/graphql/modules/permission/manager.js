import { AuthenticationError, ForbiddenError } from 'apollo-server'
import { find } from 'lodash'
import { errorText } from '@services/joi'

const permissionAccessTypeEnum = {
  CREATE_USER: 'CREATE_USER',
  READ_USER: 'READ_USER',
  UPDATE_USER: 'UPDATE_USER'
}

const permissionAccessLevelEnum = {
  NONE: { key: 'NONE', value: 0 },
  OWNER: { key: 'OWNER', value: 1 },
  ALL: { key: 'ALL', value: 2 },
  ADMIN: { key: 'ADMIN', value: 3 },
  SUPER: { key: 'SUPER', value: 4 }
}

// This should be called on every mutation, as it respects the directives on the data type
const checkPermissionsAndProtectedFields = async (entityBeingUpdated, args, context, info) => {
  await checkPermissions(entityBeingUpdated, args, context, info)
  await checkProtectedFields(entityBeingUpdated, args, context, info)
}

const checkPermissions = async (entityBeingUpdated, args, context, info) => {
  const { user } = context

  const entityType = info.returnType.name
  const entityUpdatePermissionName = `UPDATE_${entityType.toUpperCase()}`

  if (entityType.toLowerCase() === 'user') {
    entityBeingUpdated.createdBy = entityBeingUpdated.id
  }

  // Check for usePermissions directive
  const userPermissionsDirective = find(info.returnType.astNode.directives, (directive) => {
    return directive.name.value === 'usePermissions'
  })

  if (userPermissionsDirective) {
    const updatePermissionSpecified = find(userPermissionsDirective.arguments, (argument) => {
      return argument.value.value === entityUpdatePermissionName
    })

    if (userPermissionsDirective.arguments.length === 0 || updatePermissionSpecified) {
      // If the directive was specified on the entity, then we don't want to allow anonymous updates
      if (!user) {
        throw new AuthenticationError(errorText.authenticationError())
      }

      const isOwner = entityBeingUpdated.createdBy === user.id
      const updatePermission = find(user.permissions, { accessType: entityUpdatePermissionName })
      const usersPermissionAccessLevel = permissionAccessLevelEnum[updatePermission.accessLevel].value

      if (usersPermissionAccessLevel === permissionAccessLevelEnum.NONE.value) {
        throw new ForbiddenError(errorText.noAccessUpdate(entityType))
      } else if (usersPermissionAccessLevel === permissionAccessLevelEnum.OWNER.value && !isOwner) {
        throw new ForbiddenError(errorText.notOwnerUpdate())
      }
    }
  }
}

const checkProtectedFields = async (entityBeingUpdated, args, context, info) => {
  const { user } = context
  const { data } = args

  Object.keys(data).forEach((field) => {
    const entityType = info.returnType.name
    const entityUpdatePermissionName = `UPDATE_${entityType.toUpperCase()}`

    if (entityType.toLowerCase() === 'user') {
      entityBeingUpdated.createdBy = entityBeingUpdated.id
    }

    // Check for protected directive
    const protectedDirective = find(info.returnType._fields[field].astNode.directives, (directive) => {
      return directive.name.value === 'protected'
    })

    if (protectedDirective) {
      const updatePermissionSpecified = find(protectedDirective.arguments, (argument) => {
        return argument.value.value === entityUpdatePermissionName
      })

      if (protectedDirective.arguments.length === 0 || updatePermissionSpecified) {
        // Check if user has admin update or is owner
        const isOwner = entityBeingUpdated.createdBy === user.id
        const updatePermission = find(user.permissions, { accessType: entityUpdatePermissionName })
        const usersPermissionAccessLevel = permissionAccessLevelEnum[updatePermission.accessLevel].value

        if (!(isOwner || usersPermissionAccessLevel >= permissionAccessLevelEnum.ADMIN.value)) {
          throw new ForbiddenError(errorText.protectedFieldUpdate(field))
        }
      }
    }
  })
}

const updatePermission = async (root, args, context, info) => {
  const { prisma } = context
  prisma.mutation.updatePermission({}, info)
}

const publicProps = {
  permissionAccessTypeEnum,
  permissionAccessLevelEnum,

  checkPermissionsAndProtectedFields,

  updatePermission
}

module.exports = publicProps
export default publicProps
