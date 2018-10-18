import config from '@config'
import uuid from 'uuid/v4'
import bcrypt from 'bcrypt'

import { hashPassword, generateJWT } from '@services/jwt'
import { Joi, errorTypes, error } from '@services/joi'
import mailer from '@services/mailer'

import { notificationText, createNotification } from '@modules/notification/manager'
import { createUser, getUser, getUserDisplayName } from '@modules/user/manager'

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
    return error({ type: errorTypes.notFound, field: 'username' })
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    return error({ type: errorTypes.incorrectPassword, field: 'password' })
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
    return error({ type: errorTypes.notFound, field: 'email' })
  }

  user.forgotPasswordToken = await generateJWT(user)

  mailer.sendEmail(mailer.emailEnum.forgotPassword, [user.email], user)
  return 'Email sent'
}

const registerUser = async (root, args, context, info) => {
  const validationSchema = {
    email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    username: Joi.string().alphanum(),
    password: Joi.string().regex(config.passwordRegex).required(),
    firstName: Joi.string(),
    lastName: Joi.string()
  }

  Joi.validate(args, validationSchema)

  const user = await createUser(root, args, context, info)

  user.verifyEmailToken = await generateJWT(user)
  mailer.sendEmail(mailer.emailEnum.verifyEmail, [user.email], user)

  return 'User created, we will email you to verify your email.'
}

const inviteUser = async (root, args, context, info) => {
  const { user } = context
  const { email, firstName, lastName } = args

  const validationSchema = {
    email: Joi.string().email({ minDomainAtoms: 2 }).required()
  }

  Joi.validate({ email }, validationSchema)

  const invitee = await createUser(root, { email, firstName, lastName, password: uuid() }, context, info)
  invitee.inviter = user.id

  invitee.verifyEmailToken = await generateJWT(invitee)
  mailer.sendEmail(mailer.emailEnum.invite, [invitee.email], { invitee, inviter: user })

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

  if (!user.confirmed) {
    if (context.decodedToken.user.inviter) {
      const inviter = await prisma.query.user({ where: { id: context.decodedToken.user.inviter } })
      const inviteeDisplayName = await getUserDisplayName(user)

      const inviteAcceptedNotificationData = {
        recipient: inviter,
        message: notificationText.inviteAccepted(inviteeDisplayName),
        mailerArgs: [mailer.emailEnum.inviteAccepted, [inviter.email], { invitee: user, inviter }]
      }
      createNotification(root, inviteAcceptedNotificationData, context, info)
    }

    const welcomeNotificationData = {
      recipient: user,
      message: notificationText.welcome()
    }

    createNotification(root, welcomeNotificationData, context, info)
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

  const passwordChangedNotificationData = {
    recipient: updatedUser,
    message: notificationText.passwordChanged(),
    mailerArgs: [mailer.emailEnum.passwordChanged, [updatedUser.email], updatedUser]
  }

  createNotification(root, passwordChangedNotificationData, context, info)

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
