import { SchemaDirectiveVisitor } from 'graphql-tools'
import { AuthenticationError } from 'apollo-server'
import { errorText } from '@services/joi'

class isAuthenticated extends SchemaDirectiveVisitor {
  visitFieldDefinition (field, details) {
    this.isAuthenticated(field)
  }

  isAuthenticated (field) {
    const { resolve } = field

    field.resolve = async (...args) => {
      const [, , context] = args

      if (context.user) {
        return resolve.apply(this, args)
      }

      throw new AuthenticationError(errorText.authenticationError())
    }
  }
}

module.exports = isAuthenticated
export default isAuthenticated
