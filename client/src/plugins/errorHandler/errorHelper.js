const fieldPlaceHolder = '{field}'

const errorMessages = {
  required: `${fieldPlaceHolder} is required.`,
  notSameAsUsername: `${fieldPlaceHolder} cannot match Username.`,
  notSameAsEmail: `${fieldPlaceHolder} cannot match Email.`,
  sameAsPassword: `Passwords must match.`,
  email: `Please enter a valid ${fieldPlaceHolder}.`,
  phoneNumber: `Please enter a valid phone number`,
  cron: `Please enter a valid cron string`
}

var evaluateError = function (fieldName, validator) {
  // Get the appropriate error message from errorMessages object, and plug in field name
  const errorMessage = errorMessages[validator]

  // if field name gets pluged into the beginning of the string leave it capitalized, otherwise toLower
  if (errorMessage.indexOf(fieldPlaceHolder) > 0) {
    fieldName = fieldName.toLowerCase()
  }

  // replace {field} with the appropriate field name and return error message
  return errorMessages[validator].replace(fieldPlaceHolder, fieldName)
}

export default (fieldProperty, propertyName, errorKey, serverErrors = []) => {
  // Check for server errors first
  if (serverErrors && serverErrors.length > 0) {
    for (let i = 0; i < serverErrors.length; i++) {
      const serverError = serverErrors[i]
      const errorMessageFound = serverError.extensions.exception.invalidArgs.includes(errorKey)

      if (errorMessageFound) {
        return serverError.message
      }
    }
  }

  // Commented as I am sure this is confusing
  // Loop through validators
  for (var key in fieldProperty.$params) {
    // if a validator fails stop loop and return error
    if (!fieldProperty[key]) {
      // return the property error message text for the failed validator
      return evaluateError(propertyName, key)
    }
  }
}
