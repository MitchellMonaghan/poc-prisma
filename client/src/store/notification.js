import { extend } from 'quasar'

import {
  getNotificationsQuery
} from 'src/graphql/queries'

import {
  notificationSubscription
} from 'src/graphql/subscriptions'

const state = extend({}, {
  notifications: []
})

const mutations = extend({}, {
  addNewNotifications (state, newNotifications) {
    state.notifications = newNotifications.concat(state.notifications)
  }
})

const actions = extend({}, {
  async getNotifications ({commit}, userId) {
    const response = await this._vm.$apollo.query({
      variables: { where: { createdBy: { id: userId } } },
      query: getNotificationsQuery
    })

    commit('addNewNotifications', response.data.notifications)
  },

  async subscribe ({commit}, userId) {
    await this._vm.$apollo.subscribe({
      variables: { where: { node: { createdBy: { id: userId } } } },
      query: notificationSubscription
    }).subscribe({
      next (response) {
        console.log(response)
        commit('addNewNotifications', [response.data.notification.node])
      },
      error (error) {
        console.log(error)
      }
    })
  }

  /*
  async unsubscribe ({ commit }) {
    await this._vm.$apollo.mutate({
      variables: form,
      mutation: registerUserMutation
    })
  }
  */
})

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
