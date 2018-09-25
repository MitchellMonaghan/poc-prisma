import manager from './manager'

export default {
  Query: {
    refreshToken: async (root, args, context, info) => manager.refreshToken(root, args, context, info),

    authenticateUser: async (root, args, context, info) => manager.authenticateUser(root, args, context, info),
    forgotPassword: async (root, args, context, info) => manager.forgotPassword(root, args, context, info)
  },

  Mutation: {
    inviteUser: async (root, args, context, info) => manager.inviteUser(root, args, context, info),
    changePassword: async (root, args, context, info) => manager.changePassword(root, args, context, info),
    verifyEmail: async (root, args, context, info) => manager.verifyEmail(root, args, context, info),
    registerUser: async (root, args, context, info) => manager.registerUser(root, args, context, info)
  }
}
