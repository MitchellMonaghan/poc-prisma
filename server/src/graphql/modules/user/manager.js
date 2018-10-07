import { UserInputError } from 'apollo-server'
import { hashPassword } from '@services/jwt'
import { Joi, errorText } from '@services/joi'
import { find, pick, first } from 'lodash'

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
        { accessType: permissionAccessTypeEnum.CREATE_USER, accessLevel: permissionAccessLevelEnum.ALL.key },
        { accessType: permissionAccessTypeEnum.READ_USER, accessLevel: permissionAccessLevelEnum.ALL.key },
        { accessType: permissionAccessTypeEnum.UPDATE_USER, accessLevel: permissionAccessLevelEnum.OWNER.key },

        { accessType: permissionAccessTypeEnum.READ_NOTIFICATION, accessLevel: permissionAccessLevelEnum.OWNER.key },
        { accessType: permissionAccessTypeEnum.UPDATE_NOTIFICATION, accessLevel: permissionAccessLevelEnum.OWNER.key }
      ]
    }

    if (user.username) {
      const userNameExists = await prisma.query.user({
        where: { username: user.username }
      })

      if (userNameExists) {
        throw new UserInputError(errorText.usernameAlreadyTaken(user.username), {
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
  } else if (user && !user.confirmed) {
    // If user exists and is not verified, save the new password and send verify email
    const password = await hashPassword(args.password)

    await prisma.mutation.updateUser({
      where: { email: args.email },
      data: { password }
    })
  } else if (user && user.confirmed) {
    // If user exists and is verified, throw error
    throw new UserInputError(errorText.emailAlreadyTaken(args.email), {
      invalidArgs: [
        'email'
      ]
    })
  }

  return user
}

const getUsers = async (root, args, context, info) => {
  const { prisma } = context
  return prisma.query.users(args, info)
}

const getUser = async (root, args, context, info) => {
  const { prisma } = context
  const { id, username, email } = args.where

  const validationSchema = Joi.object().keys({
    id: Joi.string(),
    email: Joi.string(),
    username: Joi.string()
  }).or('id', 'email', 'username')

  Joi.validate(args.where, validationSchema)

  return first(await prisma.query.users({
    where: {
      OR: [
        { id },
        { username },
        { email },
        { username: email },
        { email: username }
      ]
    }
  }, info))
}

const updateUser = async (root, args, context, info) => {
  const { prisma, user } = context
  const { where } = args
  const data = pick(args.data, 'username', 'firstName', 'lastName')

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
  }, `{
    id
    permissions {
      accessType
      accessLevel
    }
  }`)

  if (data.username) {
    // if updating username check to ensure it doesnt already exist
    const userNameExists = await prisma.query.user({
      where: { username: data.username }
    })

    // if it exists ignore it if its on the user we are updating
    if (userNameExists && where.id !== userNameExists.id) {
      throw new UserInputError(errorText.usernameAlreadyTaken(data.username), {
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

  const userToBeUpdatedUpdatePermission = find(userToBeUpdated.permissions, { accessType: permissionAccessTypeEnum.UPDATE_USER })
  const userUpdatePermission = find(user.permissions, { accessType: permissionAccessTypeEnum.UPDATE_USER })

  if (permissionAccessLevelEnum[userToBeUpdatedUpdatePermission.accessLevel].value > permissionAccessLevelEnum[userUpdatePermission.accessLevel].value) {
    throw new UserInputError(errorText.cannotUpdateUserWithHigherPermission(), {
      invalidArgs: [
        'id'
      ]
    })
  }

  Joi.validate(data, dataSchemaValidation)

  await checkPermissionsAndProtectedFields(userToBeUpdated, args, context, info)

  let updatedUser = await prisma.mutation.updateUser({
    where,
    data
  }, info)

  return updatedUser
}

const publicProps = {
  createUser,
  getUsers,
  getUser,
  updateUser
}

module.exports = publicProps
export default publicProps
