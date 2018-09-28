import { ApolloError } from 'apollo-server'
import { find } from 'lodash'

const permissionAccessTypeEnum = {
  CREATE_USER: 'CREATE_USER',
  READ_USER: 'READ_USER',
  UPDATE_USER: 'UPDATE_USER'
}

const permissionAccessLevelEnum = {
  NONE: 'NONE',
  OWNER: 'OWNER',
  ALL: 'ALL',
  ADMIN: 'ADMIN',
  SUPER: 'SUPER'
}

const permissionAccessLevelValuesEnum = {
  NONE: 0,
  OWNER: 1,
  ALL: 2,
  ADMIN: 3,
  SUPER: 4
}

// Specifally used for mutations
const checkPermissionsAndProtectedFields = async (entityBeingUpdated, args, context, info) => {
  await checkPermissions(entityBeingUpdated, args, context, info)
  await checkProtectedFields(entityBeingUpdated, args, context, info)
}

// Specifally used for mutations
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
        throw new ApolloError(`You do not have the appropriate access level to udpate that record.`, '403', { status: 403 })
      }

      const isOwner = entityBeingUpdated.createdBy === user.id
      const updatePermission = find(user.permissions, { accessType: entityUpdatePermissionName })
      const usersPermissionAccessLevel = permissionAccessLevelValuesEnum[updatePermission.accessLevel]

      if (usersPermissionAccessLevel === permissionAccessLevelValuesEnum.NONE) {
        throw new ApolloError(`You do not have the appropriate access level to udpate that record.`, '403', { status: 403 })
      } else if (usersPermissionAccessLevel === permissionAccessLevelValuesEnum.OWNER && !isOwner) {
        throw new ApolloError(`You do not have the appropriate access level to udpate that record.`, '403', { status: 403 })
      }
    }
  }
}

// Specifally used for mutations
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
        const usersPermissionAccessLevel = permissionAccessLevelValuesEnum[updatePermission.accessLevel]

        if (!(isOwner || usersPermissionAccessLevel >= permissionAccessLevelValuesEnum.ADMIN)) {
          throw new ApolloError(`${field} is a protected field and can only be updated by the owner or admin access level.`, '403', { status: 403 })
        }
      }
    }
  })
}

const updatePermission = async (root, args, context, info) => {
  const { prisma } = context
  const { user, accessType, accessLevel } = args

  prisma.mutation.updatePermission({
    where: {
      user: { id: user.id },
      accessType
    },

    data: {
      accessLevel
    }
  }, info)
}

const publicProps = {
  permissionAccessTypeEnum,
  permissionAccessLevelEnum,
  permissionAccessLevelValuesEnum,

  checkPermissionsAndProtectedFields,
  checkPermissions,
  checkProtectedFields,

  updatePermission
}

module.exports = publicProps
export default publicProps
