import config from '@config'
import uuid from 'uuid/v4'
import jwt from 'jsonwebtoken'
import { pick } from 'lodash'
import { AuthenticationError, UserInputError } from 'apollo-server'

import Joi from '@services/joi'
import mailer from '@services/mailer'

import userManager from '@modules/user/manager'

// Private functions

// End private functions

// Public functions
const permissionsEnum = {
  none: 0, // no access
  owner: 1, // access owner only
  all: 2, // access all of a collection
  super: 3 // super user who cannot be tampered with
}

const generateJWT = async (user) => {
  const props = Object.assign({}, {
    user: pick(user, ['id', 'username', 'email', 'firstName', 'lastName', 'lastPasswordChange'])
  })

  // Sign token with a combination of authSecret and user password
  // This way both the server and the user has the ability to invalidate all tokens
  return jwt.sign(props, `${config.authSecret}`, { expiresIn: config.tokenExipresIn })
}

const getUserFromToken = async (root, args, context, info) => {
  try {
    const { token } = args

    const decoded = jwt.decode(token)
    // const user = await User.findById(decoded.user.id).exec()
    const user = await context.prisma.query({
      where: { id: decoded.user.id }
    })

    jwt.verify(token, `${config.authSecret}`)

    if (decoded.user.lastPasswordChange !== user.lastPasswordChange.toISOString()) {
      throw new AuthenticationError('Token invalid please authenticate.')
    }

    return user
  } catch (error) {
    return null
  }
}

const authenticateUser = async (root, args, context, info) => {
  const { password } = args
  let { username } = args

  const validationSchema = {
    username: Joi.string().required(),
    password: Joi.string().required()
  }

  Joi.validate({ username, password }, validationSchema)

  username = username.toLowerCase().trim()

  // Searching on username case insensitive
  const user = await context.prisma.query({
    where: {
      OR: [
        { username },
        { email: username }
      ]
    }
  }, info)

  // You can only login if confirmed
  if (!user || (user && !user.confirmed)) {
    throw new UserInputError('Username or email not found', {
      invalidArgs: [
        'username',
        'email'
      ]
    })
  }

  const isValid = await user.verifyPassword(password)

  if (!isValid) {
    return new UserInputError('Incorrect password', {
      invalidArgs: [
        'password'
      ]
    })
  }

  return generateJWT(user)
}

const refreshToken = async (user) => {
  return generateJWT(user)
}

const registerUser = async (root, args, context, info) => {
  const validationSchema = {
    email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    username: Joi.string().alphanum(),
    password: Joi.string().regex(config.passwordRegex).required()
  }

  Joi.validate(args, validationSchema)

  const user = await userManager.createUser(root, args, context, info)

  user.verifyEmailToken = await generateJWT(user)
  mailer.sendEmail(mailer.emailEnum.verifyEmail, [user.email], user)

  return 'User created, we will email you to verify your email.'
}

const inviteUser = async (email, user) => {
  const validationSchema = {
    email: Joi.string().email({ minDomainAtoms: 2 }).required()
  }

  Joi.validate({ email }, validationSchema)

  const invitedUser = await userManager.createUser({ email, password: uuid() })

  invitedUser.verifyEmailToken = await generateJWT(invitedUser)
  mailer.sendEmail(mailer.emailEnum.invite, [invitedUser.email], { invitedUser, invitee: user })

  return `Success`
}

const forgotPassword = async (root, args, context, info) => {
  const { email } = args

  const validationSchema = {
    email: Joi.string().email({ minDomainAtoms: 2 }).required()
  }

  Joi.validate({ email }, validationSchema)

  const user = await context.prisma.query({
    where: { email }
  })

  if (!user || (user && !user.confirmed)) {
    throw new UserInputError('Email not found', {
      invalidArgs: [
        'email'
      ]
    })
  }

  user.forgotPasswordToken = await generateJWT(user)

  mailer.sendEmail(mailer.emailEnum.forgotPassword, [email], user)
  return 'Email sent'
}

const verifyEmail = async (user) => {
  user.confirmed = true
  user.save()

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
  generateJWT,
  getUserFromToken,
  authenticateUser,
  refreshToken,
  registerUser,
  inviteUser,
  forgotPassword,
  verifyEmail,
  changePassword
}

module.exports = publicProps
export default publicProps
