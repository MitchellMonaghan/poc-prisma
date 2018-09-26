import { UserInputError } from 'apollo-server'
import bcrypt from 'bcrypt'
import Joi from '@services/joi'
import { pick } from 'lodash'

import { permissionAccessTypeEnum, permissionAccessLevelEnum } from '@modules/permission/manager'

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
  return context.prisma.query.users({}, info)
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
  const { prisma, user } = context
  const { id, username } = args

  const validationSchema = {
    id: Joi.string().required(),
    username: Joi.string().required(),
    firstName: Joi.string(),
    lastName: Joi.string()
  }

  Joi.validate(args, validationSchema)

  delete args.id

  const userNameExists = await context.prisma.query({
    where: { username }
  }, info)

  if (userNameExists && user.id !== userNameExists.id) {
    throw new UserInputError('Username has already been taken', {
      invalidArgs: [
        'username'
      ]
    })
  }

  const userToBeUpdated = await context.prisma.query({
    where: { id }
  })

  if (userToBeUpdated.username === username) {
    delete args.username
  } else {
    Joi.validate(args.username, Joi.string().alphanum())
  }

  if (userToBeUpdated.permissions['update_user'] > user.permissions['update_user']) {
    throw new UserInputError('You can not update a user who has a higher level permission than you.', {
      invalidArgs: [
        'id'
      ]
    })
  }

  let updatedUser = await prisma.mutation.updateUser({
    where: { id },
    data: args
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

const hashPassword = async (password) => {
  const saltRounds = 10
  const salt = bcrypt.genSaltSync(saltRounds)
  return bcrypt.hashSync(password, salt)
}

const publicProps = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser
}

module.exports = publicProps
export default publicProps
