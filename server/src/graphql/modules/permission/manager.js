import { AuthenticationError, ForbiddenError } from 'apollo-server'
import { find } from 'lodash'
import { errorText } from '@services/joi'

const permissionAccessTypeEnum = {
  CREATE_USER: 'CREATE_USER',
  READ_USER: 'READ_USER',
  UPDATE_USER: 'UPDATE_USER',

  READ_NOTIFICATION: 'READ_NOTIFICATION',
  UPDATE_NOTIFICATION: 'UPDATE_NOTIFICATION'
}

const permissionAccessLevelEnum = {
  NONE: { key: 'NONE', value: 0 },
  OWNER: { key: 'OWNER', value: 1 },
  ALL: { key: 'ALL', value: 2 },
  ADMIN: { key: 'ADMIN', value: 3 },
  SUPER: { key: 'SUPER', value: 4 }
}

const addFragmentToFieldResolvers = (schemaAST, fragmentSelection = `{ id createdBy { id } }`) => {
  // id and createdBy.id are required by the system to determine if the requesting user is the owner
  // and so this fragment will need to be added to all prisma requests
  return schemaAST.definitions.reduce((result, schemaDefinition) => {
    if (schemaDefinition.kind === 'ObjectTypeDefinition') {
      return {
        ...result,
        [schemaDefinition.name.value]: schemaDefinition.fields.reduce((result, fieldDefinition) => {
          // TODO: this includes check is naive and will break for some strings
          if (fragmentSelection.includes(fieldDefinition.name.value)) {
            return result
          }

          return {
            ...result,
            [fieldDefinition.name.value]: {
              fragment: `fragment Fragment on ${schemaDefinition.name.value} ${fragmentSelection}`,
              resolve: (parent, args, context, info) => {
                return parent[fieldDefinition.name.value]
              }
            }
          }
        }, {})
      }
    } else {
      return result
    }
  }, {})
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
    entityBeingUpdated.createdBy = { id: entityBeingUpdated.id }
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

      const isOwner = entityBeingUpdated.createdBy.id === user.id
      const usersPermissionAccessLevel = getPermisionAccessLevel(entityUpdatePermissionName, user)

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
  let { data } = args

  if (!data) {
    data = info.returnType._fields
  }

  Object.keys(data).forEach((field) => {
    const entityType = info.returnType.name
    const entityUpdatePermissionName = `UPDATE_${entityType.toUpperCase()}`

    if (entityType.toLowerCase() === 'user') {
      entityBeingUpdated.createdBy.id = entityBeingUpdated.id
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
        const isOwner = entityBeingUpdated.createdBy.id === user.id

        if (!(isOwner || getPermisionAccessLevel(entityUpdatePermissionName, user) >= permissionAccessLevelEnum.ADMIN.value)) {
          throw new ForbiddenError(errorText.protectedFieldUpdate(field))
        }
      }
    }
  })
}

const getPermisionAccessLevel = (accessType, user) => {
  const permission = find(user.permissions, { accessType })
  return permissionAccessLevelEnum[permission.accessLevel].value
}

const updatePermission = async (root, args, context, info) => {
  const { prisma } = context
  prisma.mutation.updatePermission(args, info)
}

export {
  permissionAccessTypeEnum,
  permissionAccessLevelEnum,

  addFragmentToFieldResolvers,
  checkPermissionsAndProtectedFields,

  getPermisionAccessLevel,
  updatePermission
}
