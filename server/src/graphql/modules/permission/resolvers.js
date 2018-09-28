import manager from './manager'

export default {
  Query: {
  },

  Mutation: {
    updatePermission: async (root, args, context, info) => manager.updatePermission(root, args, context, info)
  }
}
