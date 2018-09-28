import { UserInputError } from 'apollo-server'
import { hashPassword } from '@services/jwt'
import Joi from '@services/joi'
import { pick, first } from 'lodash'

import { permissionAccessTypeEnum, permissionAccessLevelEnum, checkPermissionsAndProtectedFields } from '@modules/permission/manager'

const createUser = async (root, args, context, info) => {
  const { prisma } = context

  let user = await prisma.query.user({
    where: { email: args.email }
  })

  if (!user) {
    // User doesn't exist, create a new user
    user = pick(args, 'firstName', 'lastName', 'username', 'email', 'password')
    user.email = user.email.trim().toLowerCase()
    user.confirmed = false
    user.lastPasswordChange = new Date()
    user.password = await hashPassword(user.password)
    user.permissions = {
      create: [
        { accessType: permissionAccessTypeEnum.CREATE_USER, accessLevel: permissionAccessLevelEnum.ALL },
        { accessType: permissionAccessTypeEnum.READ_USER, accessLevel: permissionAccessLevelEnum.ALL },
        { accessType: permissionAccessTypeEnum.UPDATE_USER, accessLevel: permissionAccessLevelEnum.OWNER }
      ]
    }

    if (user.username) {
      const userNameExists = await prisma.query.user({
        where: { username: user.username }
      }, info)

      if (userNameExists) {
        throw new UserInputError('Username has already been taken', {
          invalidArgs: [
            'username'
          ]
        })
      }
    } else {
      user.username = user.email
    }

    user = await prisma.mutation.createUser({
      data: user
    })

    // await createDefaultPermissions(root, { userId: userInDatabase.id }, context, info)
  } else if (user && !user.confirmed) {
    // If user exists and is not verified, save the new password and send verify email
    const password = await hashPassword(args.password)

    await prisma.mutation.updateUser({
      where: { email: args.email },
      data: { password }
    })
  } else if (user && user.confirmed) {
    // If user exists and is verified, throw error
    throw new UserInputError('Email has already been registered', {
      invalidArgs: [
        'email'
      ]
    })
  }

  return user
}

const getUsers = async (root, args, context, info) => {
  const { prisma } = context
  return prisma.query.users({}, info)
}

const getUser = async (root, args, context, info) => {
  const { prisma } = context
  const { id } = args

  const validationSchema = {
    id: Joi.string().required()
  }

  Joi.validate({ id }, validationSchema)

  return prisma.query({
    where: { id }
  }, info)
}

const updateUser = async (root, args, context, info) => {
  const { prisma } = context
  const { where, data } = args

  const whereSchemaValidation = {
    id: Joi.string().required()
  }

  const dataSchemaValidation = {
    username: Joi.string().alphanum().required(),
    firstName: Joi.string(),
    lastName: Joi.string()
  }

  Joi.validate(where, whereSchemaValidation)

  const userToBeUpdated = await prisma.query.user({
    where
  }, info)

  // if updating username check to ensure it doesnt already exist
  if (data.username) {
    const userNameExists = await prisma.query.user({
      where: { username: data.username }
    }, info)

    // if it exists ignore it if its on the user we are updating
    if (userNameExists && where.id !== userNameExists.id) {
      throw new UserInputError('Username has already been taken', {
        invalidArgs: [
          'username'
        ]
      })
    }
  } else {
    // If were defaulting to use the username already set by the user
    // then we can remove the alphanum requirement, as the username might
    // have been defaulted to a email
    dataSchemaValidation.username = Joi.string().required()
    data.username = userToBeUpdated.username
  }

  /* TODO: Need to better define how permission stuff is going to work
  if (userToBeUpdated.permissions['update_user'] > user.permissions['update_user']) {
    throw new UserInputError('You can not update a user who has a higher level permission than you.', {
      invalidArgs: [
        'id'
      ]
    })
  }
  */

  Joi.validate(data, dataSchemaValidation)

  await checkPermissionsAndProtectedFields(userToBeUpdated, args, context, info)

  let updatedUser = await prisma.mutation.updateUser({
    where,
    data
  })

  return updatedUser
}

const deleteUser = async (root, args, context, info) => {
  const { id } = args
  const { prisma } = context

  const validationSchema = {
    id: Joi.string().required()
  }

  Joi.validate({ id }, validationSchema)

  return prisma.mutation.deleteUser({
    where: { id }
  }, info)
}

const userExists = async (prisma, { username, email }) => {
  const users = await prisma.query.users({
    where: {
      OR: [
        { username },
        { email },
        { username: email },
        { email: username }
      ]
    }
  })

  const user = first(users)

  if (!user || (user && !user.confirmed)) {
    throw new UserInputError('Username or email not found', {
      invalidArgs: [
        'username',
        'email'
      ]
    })
  }

  return user
}

const publicProps = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,

  userExists
}

module.exports = publicProps
export default publicProps
