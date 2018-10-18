import Joi from 'joi'
import { assign } from 'lodash'
import { ApolloError, UserInputError } from 'apollo-server'

// Permission Errors
// Error text should only contain error text for developers, these are errors that the client should never see
// as they are permission based and the client shouldn't show things the user does not have access to do.
// TODO: support i18n?
const errorText = {
  authenticationError: () => 'Token invalid please authenticate.',
  protectedFieldRead: (fieldName) => `${fieldName} is a protected field and can only be read by owner and admin.`,
  protectedFieldUpdate: (fieldName) => `${fieldName} is a protected field and can only be updated by owner and admin.`,
  requiresPermission: (fieldName, requiredPermission, requiredAccessLevel) => `${fieldName} requires a minimum access of ${requiredPermission}:${requiredAccessLevel}.`,
  noAccessRead: (entity) => `You are not allowed to view ${entity} records.`,
  noAccessUpdate: (entity) => `You are not allowed to update ${entity} records.`,
  notOwnerRead: (entity) => `You can only view your own ${entity} records.`,
  notOwnerUpdate: (entity) => `You can only update your own ${entity} records.`,
  cannotUpdateUserWithHigherPermission: () => `You can not update a user who has a higher level permission than you.`
}

// Error types are errors that shuold be displayed to the client, we
// provide a error code/string for the client to use for i18n translation
const errorTypes = {
  alreadyTaken: 'alreadyTaken',
  notFound: 'notFound',
  required: 'required',
  alphaNum: 'alphaNum',
  email: 'email',
  passwordComplexity: 'passwordComplexity',
  incorrectPassword: 'incorrectPassword'
}

const validate = Joi.validate
Joi.validate = (data, validationSchema, options) => {
  const defaultOptions = {
    abortEarly: false
  }

  const response = validate(data, validationSchema, assign(defaultOptions, options))
  let { error } = response

  if (error) {
    const errors = error.details.map((details) => {
      let type

      // Map the joi error types to error strings/codes that I
      // would like the front end to be using for i18n conversion
      switch (details.type) {
        case 'any.empty':
          type = 'required'
          break
        case 'string.alphanum':
          type = 'alphaNum'
          break
        case 'string.email':
          type = 'email'
          break
        case 'string.regex.base':
          if (details.context.key === 'password') {
            type = 'passwordComplexity'
          }
          break
        default:
          if (!details.type) {
            type = 'serverError'
          }
      }

      return { type, field: details.context.key }
    })

    throw new UserInputError(error.message, {
      errors: [
        ...errors
      ]
    })
  }
}

const error = (additionalProps) => {
  throw new ApolloError('error', 'error', additionalProps)
}

const publicProps = {
  errorText,
  errorTypes,
  Joi,
  error
}

module.exports = publicProps
export default publicProps
