import { extend } from 'quasar'
import { findIndex } from 'lodash'

import {
  getNotificationsQuery
} from 'src/graphql/queries'

import {
  updateNotificationMutation
} from 'src/graphql/mutations'

import {
  notificationSubscription
} from 'src/graphql/subscriptions'

const state = extend({}, {
  notifications: []
})

const mutations = extend({}, {
  upsertNotifications (state, newNotifications) {
    newNotifications = Array.isArray(newNotifications) ? newNotifications : [newNotifications]

    const toBeAppendedToFront = []

    newNotifications.forEach(notification => {
      const notificationIndex = findIndex(state.notifications, { id: notification.id })

      if (notificationIndex >= 0) {
        state.notifications[notificationIndex] = notification
      } else {
        toBeAppendedToFront.push(notification)
      }
    })

    state.notifications = toBeAppendedToFront.concat(state.notifications)
  }
})

const actions = extend({}, {
  async updateNotification ({commit}, notification) {
    await this._vm.$apollo.mutate({
      variables: {
        where: { id: notification.id },
        data: { viewed: notification.viewed }
      },
      mutation: updateNotificationMutation
    })
  },

  async getNotifications ({commit}, userId) {
    const response = await this._vm.$apollo.query({
      variables: { where: { createdBy: { id: userId } } },
      query: getNotificationsQuery
    })

    commit('upsertNotifications', response.data.notifications)
  },

  async subscribe ({commit}, userId) {
    await this._vm.$apollo.subscribe({
      variables: { where: { node: { createdBy: { id: userId } } } },
      query: notificationSubscription
    }).subscribe({
      next (response) {
        commit('upsertNotifications', [response.data.notification.node])
      },
      error (error) {
        console.log(error)
      }
    })
  }
})

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
