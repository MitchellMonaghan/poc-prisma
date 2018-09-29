import manager from './manager'

export default {
  Query: {
    notifications: async (root, args, context, info) => manager.getNotifications(root, args, context, info)
  },

  Mutation: {
    updateNotification: async (root, args, context, info) => manager.updateNotification(root, args, context, info)
  },

  Subscription: {
    notification: {
      subscribe: async (parent, args, context, info) => {
        return context.prisma.subscription.notification({}, info)
      }
    }
  }
}
