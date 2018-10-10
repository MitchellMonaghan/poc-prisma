import Joi from 'joi'
import { assign } from 'lodash'
import { ApolloError } from 'apollo-server'

const errorTypes = {
  authenticationError: 'authenticationError',
  protectedFieldRead: 'protectedFieldRead',
  protectedFieldUpdate: 'protectedFieldUpdate',
  requiresPermission: 'requiresPermission',
  noAccessRead: 'noAccessRead',
  noAccessUpdate: 'noAccessUpdate',
  notOwnerRead: 'notOwnerRead',
  notOwnerUpdate: 'notOwnerUpdate',
  cannotUpdateUserWithHigherPermission: 'cannotUpdateUserWithHigherPermission',

  alreadyTaken: 'alreadyTaken',
  notFound: 'notFound',
  required: 'required',
  alphaNum: 'alphaNum',
  notSameAsUsername: 'notSameAsUsername',
  notSameAsEmail: 'notSameAsEmail',
  sameAsPassword: 'sameAsPassword',
  email: 'email',
  phoneNumber: 'phoneNumber',
  cron: 'cron',
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

    throw new Error(JSON.stringify(errors))
  }
}

const error = (additionalProps) => {
  throw new ApolloError('error', 'error', additionalProps)
}

const publicProps = {
  errorTypes,
  Joi,
  error
}

module.exports = publicProps
export default publicProps
