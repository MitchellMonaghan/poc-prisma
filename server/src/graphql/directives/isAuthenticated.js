import { SchemaDirectiveVisitor } from 'graphql-tools'
import { AuthenticationError } from 'apollo-server'

class isAuthenticated extends SchemaDirectiveVisitor {
  visitFieldDefinition (field, details) {
    this.isAuthenticated(field)
  }

  isAuthenticated (field) {
    if (field.resolve) {
      const { resolve } = field
      field.resolve = async (...args) => {
        const [, , context] = args

        if (context.user) {
          return resolve.apply(this, args)
        }

        throw new AuthenticationError('Token invalid please authenticate.')
      }
    } else if (field.subscribe) {
      const { subscribe } = field
      field.subscribe = async (...args) => {
        const [, , context] = args

        if (context.user) {
          return subscribe.apply(this, args)
        }

        throw new AuthenticationError('Token invalid please authenticate.')
      }
    }
  }
}

module.exports = isAuthenticated
export default isAuthenticated
