import * as manager from './manager'

export default {
  Query: {
    users: async (root, args, context, info) => manager.getUsers(root, args, context, info),
    user: async (root, args, context, info) => manager.getUser(root, args, context, info)
  },

  Mutation: {
    updateUser: async (root, args, context, info) => manager.updateUser(root, args, context, info)
  }
}
