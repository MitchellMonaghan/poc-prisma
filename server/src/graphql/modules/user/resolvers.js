import manager from './manager'

export default {
  Query: {
    getUsers: async (root, args, context, info) => manager.getUsers(root, args, context, info),
    getUser: async (root, args, context, info) => manager.getUser(root, args, context, info)
  },

  Mutation: {
    updateUser: async (root, args, context, info) => manager.updateUser(root, args, context, info),
    deleteUser: async (root, args, context, info) => manager.deleteUser(root, args, context, info)
  }
}
