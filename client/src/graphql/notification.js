import gql from 'graphql-tag'

const init = (apollo, store) => {
  const queries = {
    getNotifications: gql`
      query($where: NotificationWhereInput!) {
        notifications(where: $where) {
          id
          message
          viewed
        }
      }
    `
  }

  const mutations = {
    updateNotification: gql`
      mutation updateNotification($where: NotificationWhereUniqueInput!, $data: NotificationUpdateInput!) {
        updateNotification(where: $where, data: $data) {
          id
          message
          viewed
        }
      }
    `
  }

  const subscriptions = {
    notification: gql`
      subscription($where: NotificationSubscriptionWhereInput!) {
        notification(where: $where) {
          mutation
          previousValues {
            id
            viewed
          }
          node {
            id
            message
            viewed
          }
        }
      }
    `
  }

  return {
    // Queries
    getNotifications: async (userId) => {
      const response = await apollo.query({
        variables: { where: { createdBy: { id: userId } } },
        query: queries.getNotifications
      })

      store.dispatch('notification/upsertNotifications', response.data.notifications)
    },

    // Mutations
    updateNotification: async (notification) => {
      await apollo.mutate({
        variables: {
          where: { id: notification.id },
          data: { viewed: notification.viewed }
        },
        mutation: mutations.updateNotification
      })
    },

    // Subscription
    subscribeToNotifications: async (userId) => {
      await apollo.subscribe({
        variables: {
          where: {
            node: { createdBy: { id: userId } }
          }
        },
        query: subscriptions.notification
      }).subscribe({
        next (response) {
          if (response.data.notification.mutation === 'DELETED') {
            store.dispatch('notification/deleteNotification', response.data.notification.previousValues.id)
          } else {
            store.dispatch('notification/upsertNotifications', [response.data.notification.node])
          }
        },
        error (error) {
          console.log(error)
        }
      })
    }
  }
}

export default init
