import Joi from 'joi'
import { UserInputError } from 'apollo-server'

const errorText = {
  // Permission Errors
  authenticationError: () => 'Token invalid please authenticate.',
  protectedFieldRead: (fieldName) => `${fieldName} is a protected field and can only be read by owner and admin.`,
  protectedFieldUpdate: (fieldName) => `${fieldName} is a protected field and can only be updated by owner and admin.`,
  requiresPermission: (fieldName, requiredPermission, requiredAccessLevel) => `${fieldName} requires a minimum access of ${requiredPermission}:${requiredAccessLevel}.`,
  noAccessRead: (entity) => `You are not allowed to view ${entity} records.`,
  noAccessUpdate: (entity) => `You are not allowed to update ${entity} records.`,
  notOwnerRead: (entity) => `You can only view your own ${entity} records.`,
  notOwnerUpdate: (entity) => `You can only update your own ${entity} records.`,
  cannotUpdateUserWithHigherPermission: () => `You can not update a user who has a higher level permission than you.`,

  // User input errors
  userNotFound: () => `User not found.`,
  incorrectPassword: () => `Incorrect password.`,
  usernameAlreadyTaken: (username) => `The user name ${username} has already been taken.`,
  emailAlreadyTaken: (email) => `The email ${email} has already been registered.`
}

const validate = Joi.validate
Joi.validate = (data, validationSchema) => {
  let { error } = validate(data, validationSchema)

  if (error) {
    error = error.details[0]
    error.message = error.type === 'string.regex.base' && error.context.key === 'password'
      ? 'Password does not meet complexity requirements' : error.message

    throw new UserInputError(error.message, {
      invalidArgs: [
        error.context.key
      ]
    })
  }
}

const publicProps = {
  errorText,
  Joi
}

module.exports = publicProps
export default publicProps
