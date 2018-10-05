import config from '@config'
import uuid from 'uuid/v4'
import bcrypt from 'bcrypt'
import { UserInputError } from 'apollo-server'

import { hashPassword, generateJWT } from '@services/jwt'
import { Joi, errorText } from '@services/joi'
import mailer from '@services/mailer'

import { createNotification } from '@modules/notification/manager'
import { createUser, getUser } from '@modules/user/manager'

// Private functions

// End private functions

// Public functions
const authenticateUser = async (root, args, context, info) => {
  const { username, password } = args

  const validationSchema = {
    username: Joi.string().required(),
    password: Joi.string().required()
  }

  Joi.validate({ username, password }, validationSchema)

  const user = await getUser(root, { where: { username } }, context)

  if (!user || (user && !user.confirmed)) {
    throw new UserInputError(errorText.userNotFound(), {
      invalidArgs: [
        'username',
        'email'
      ]
    })
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    return new UserInputError(errorText.incorrectPassword(), {
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
  const { email } = args

  const validationSchema = {
    email: Joi.string().email({ minDomainAtoms: 2 }).required()
  }

  Joi.validate(args, validationSchema)

  const user = await getUser(root, { where: { email } }, context)

  if (!user || (user && !user.confirmed)) {
    throw new UserInputError(errorText.userNotFound(), {
      invalidArgs: [
        'email'
      ]
    })
  }

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

const inviteUser = async (root, args, context, info) => {
  const { user } = context
  const { email } = args

  const validationSchema = {
    email: Joi.string().email({ minDomainAtoms: 2 }).required()
  }

  Joi.validate({ email }, validationSchema)

  const invitedUser = await createUser(root, { email, password: uuid() }, context, info)
  invitedUser.invitee = user.id

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

  if (context.decodedToken.user.invitee) {
    createNotification(
      root,
      {
        createdBy: { connect: { id: context.decodedToken.user.invitee } },
        message: `${user.email} has accepted your invite to ${config.productName}!`
      },
      context,
      info
    )
  }

  return 'Success'
}

const changePassword = async (root, args, context, info) => {
  const { prisma } = context
  const { id, password } = args

  const validationSchema = {
    id: Joi.string().required(),
    password: Joi.string().regex(config.passwordRegex).required()
  }

  Joi.validate({ id, password }, validationSchema)

  const passwordHash = await hashPassword(password)
  let updatedUser = await prisma.mutation.updateUser({
    where: { id },
    data: {
      password: passwordHash,
      lastPasswordChange: new Date()
    }
  })

  return generateJWT(updatedUser)
}
// End public functions

const publicProps = {
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
