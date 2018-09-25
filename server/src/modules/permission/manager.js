const permissionAccessTypeEnum = {
  CREATE_USER: 'CREATE_USER',
  READ_USER: 'READ_USER',
  UPDATE_USER: 'UPDATE_USER'
}

const permissionAccessLevelEnum = {
  NONE: 'NONE',
  OWNER: 'OWNER',
  ALL: 'ALL',
  SUPER: 'SUPER'
}

const permissionAccessLevelValuesEnum = {
  NONE: 0,
  OWNER: 1,
  ALL: 2,
  SUPER: 3
}

const createPermission = async (root, args, context, info) => {
  const { prisma } = context
  const { userId, accessType, accessLevel } = args

  return prisma.mutation.createPermission({
    data: {
      user: {
        connect: {
          id: userId
        }
      },
      accessType,
      accessLevel
    }
  }, info)
}

const getPermissions = async (root, args, context, info) => {
  return context.prisma.query.permissions({}, info)
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

const deletePermission = async (root, args, context, info) => {
  const { prisma } = context
  const { user, accessType } = args

  return prisma.mutation.deletePermission({
    where: {
      user: { id: user.id },
      accessType
    }
  }, info)
}

const publicProps = {
  permissionAccessTypeEnum,
  permissionAccessLevelEnum,
  permissionAccessLevelValuesEnum,

  createPermission,
  getPermissions,
  updatePermission,
  deletePermission
}

module.exports = publicProps
export default publicProps
