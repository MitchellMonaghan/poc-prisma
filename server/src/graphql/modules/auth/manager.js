import config from '@config'
import uuid from 'uuid/v4'

import bcrypt from 'bcrypt'

import { UserInputError } from 'apollo-server'

import { generateJWT } from '@services/jwt'
import Joi from '@services/joi'
import mailer from '@services/mailer'

import { createUser, userExists } from '@modules/user/manager'

// Private functions

// End private functions

// Public functions
const permissionsEnum = {
  none: 0, // no access
  owner: 1, // access owner only
  all: 2, // access all of a collection
  super: 3 // super user who cannot be tampered with
}

const authenticateUser = async (root, args, context, info) => {
  const { prisma } = context
  const { username, password } = args

  const validationSchema = {
    username: Joi.string().required(),
    password: Joi.string().required()
  }

  Joi.validate({ username, password }, validationSchema)

  const user = await userExists(prisma, { username, password })
  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    return new UserInputError('Incorrect password', {
      invalidArgs: [
        'password'
      ]
    })
  }

  return generateJWT(user)
}

const refreshToken = async (root, args, context, info) => {
  const { user } = context
  return generateJWT(user)
}

const forgotPassword = async (root, args, context, info) => {
  const { prisma } = context
  const { email } = args

  const validationSchema = {
    email: Joi.string().email({ minDomainAtoms: 2 }).required()
  }

  Joi.validate({ email }, validationSchema)

  const user = await userExists(prisma, { email })
  user.forgotPasswordToken = await generateJWT(user)

  mailer.sendEmail(mailer.emailEnum.forgotPassword, [user.email], user)
  return 'Email sent'
}

const registerUser = async (root, args, context, info) => {
  const validationSchema = {
    email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    username: Joi.string().alphanum(),
    password: Joi.string().regex(config.passwordRegex).required()
  }

  Joi.validate(args, validationSchema)

  const user = await createUser(root, args, context, info)

  user.verifyEmailToken = await generateJWT(user)
  mailer.sendEmail(mailer.emailEnum.verifyEmail, [user.email], user)

  return 'User created, we will email you to verify your email.'
}

const inviteUser = async (email, user) => {
  const validationSchema = {
    email: Joi.string().email({ minDomainAtoms: 2 }).required()
  }

  Joi.validate({ email }, validationSchema)

  const invitedUser = await createUser({ email, password: uuid() })

  invitedUser.verifyEmailToken = await generateJWT(invitedUser)
  mailer.sendEmail(mailer.emailEnum.invite, [invitedUser.email], { invitedUser, invitee: user })

  return `Success`
}

const verifyEmail = async (root, args, context, info) => {
  const { prisma, user } = context

  await prisma.mutation.updateUser({
    where: { id: user.id },
    data: {
      confirmed: true
    }
  })

  return 'Success'
}

const changePassword = async (root, args, context, info) => {
  const { id, password } = args

  const validationSchema = {
    id: Joi.string().required(),
    password: Joi.string().regex(config.passwordRegex).required()
  }

  Joi.validate({ id, password }, validationSchema)

  let updatedUser = context.prisma.mutation.updatedUser({
    where: { id },
    data: {
      password,
      lastPasswordChange: new Date()
    }
  }, info)

  return generateJWT(updatedUser)
}
// End public functions

const publicProps = {
  permissionsEnum,

  authenticateUser,
  refreshToken,
  forgotPassword,

  registerUser,
  inviteUser,
  verifyEmail,
  changePassword
}

module.exports = publicProps
export default publicProps
