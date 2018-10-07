import { extend } from 'quasar'
import { findIndex } from 'lodash'

const state = extend({}, {
  users: []
})

const actions = extend({}, {
  upsertUsers ({state}, newUsers) {
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

export default {
  namespaced: true,
  state,
  actions
}
