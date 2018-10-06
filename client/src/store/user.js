/*
import { extend } from 'quasar'

const state = extend({}, {
  users: []
})

const mutations = extend({}, {
  upsertUsers (state, newUsers) {
    newUsers = Array.isArray(newUsers) ? newUsers : [newUsers]

    const toBeAppendedToFront = []

    newUsers.forEach(user => {
      const userIndex = findIndex(state.users, { id: user.id })

      if (userIndex >= 0) {
        state.users[userIndex] = user
      } else {
        toBeAppendedToFront.push(user)
      }
    })

    state.users = toBeAppendedToFront.concat(state.users)
  }
})

const actions = extend({}, {
  async updateUser ({ commit }, form) {
    await this._vm.$apollo.mutate({
      variables: form,
      mutation: updateUserMutation
    })
  },

  async subscribe ({commit}, userId) {
    await this._vm.$apollo.subscribe({
      variables: { where: { node: { createdBy: { id: userId } } } },
      query: notificationSubscription
    }).subscribe({
      next (response) {
        console.log(response)
        commit('upsertUsers', [response.data.notification.node])
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
*/
