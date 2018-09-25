import Joi from 'joi'
import { UserInputError } from 'apollo-server'

const validate = Joi.validate

Joi.validate = (data, validationSchema) => {
  let { error } = validate(data, validationSchema)

  if (error) {
    error = error.details[0]
    error.message = error.type === 'string.regex.name' && error.context.key === 'password'
      ? 'Password does not meet complexity requirements' : error.message

    throw new UserInputError(error.message, {
      invalidArgs: [
        error.context.key
      ]
    })
  }
}

module.exports = Joi
export default Joi
