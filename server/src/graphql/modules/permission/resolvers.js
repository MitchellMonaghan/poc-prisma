import * as manager from './manager'

export default {
  Query: {
  },

  Mutation: {
    updatePermission: async (root, args, context, info) => manager.updatePermission(root, args, context, info)
  },

  Subscription: {
    permission: {
      subscribe: async (parent, args, context, info) => {
        return context.prisma.subscription.permission(args, info)
      }
    }
  }
}
