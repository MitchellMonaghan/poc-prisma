import { withParams } from 'vuelidate/lib'

export default (serverErrors, propertyName) =>
  withParams({type: 'serverError', serverErrors, propertyName}, value => {
    let hasError = false

    if (serverErrors && serverErrors.length > 0) {
      for (let i = 0; i < serverErrors.length; i++) {
        const serverError = serverErrors[i]
        hasError = serverError.extensions.exception.field === propertyName

        if (hasError) {
          break
        }
      }
    }

    return !hasError
  })
