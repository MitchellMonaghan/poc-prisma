const getErrorCode = (fieldProperty, propertyName, errorKey, serverErrors = []) => {
  // Check for server errors first
  if (serverErrors && serverErrors.length > 0) {
    for (let i = 0; i < serverErrors.length; i++) {
      const serverError = serverErrors[i]
      const errorMessageFound = serverError.extensions.exception.field === errorKey

      if (errorMessageFound) {
        return `errors.${serverError.extensions.exception.field}.${serverError.extensions.exception.type}`
      }
    }
  }

  // Commented as I am sure this is confusing
  // Loop through validators on field
  for (var key in fieldProperty.$params) {
    // if a validator fails stop loop and return error
    if (!fieldProperty[key]) {
      // return the property error code/string for the failed validator
      return `errors.${errorKey}.${key}`
    }
  }
}

const getError = (translator, fieldProperty, propertyName, errorKey, serverErrors) => {
  const errorCode = getErrorCode(fieldProperty, propertyName, errorKey, serverErrors)
  return translator(errorCode, { field: translator(`formFields.${errorKey}`) })
}

export {
  getErrorCode,
  getError
}

export default {
  getErrorCode,
  getError
}
