import { Cookies, extend } from 'quasar'
import jwt from 'jsonwebtoken'

const state = extend({}, {
  user: null,
  token: null,
  decodedToken: null
})

const actions = extend({}, {
  async setUser ({state}, user) {
    if (user) {
      state.user = user
    } else {
      state.user = null
    }
  },

  async setToken ({state}, token) {
    if (token) {
      state.token = token
      state.decodedToken = jwt.decode(token)

      Cookies.set('token', token, {
        expires: new Date(state.decodedToken.exp * 1000),
        path: '/',
        domain: window.location.hostname,
        secure: process.env.PROD // require https on production
      })
    } else {
      state.token = null
      state.decodedToken = null

      Cookies.remove('token', { path: '/' })
    }
  },

  async logout ({dispatch}) {
    await this._vm.$graphql.apollo.resetStore()
    dispatch('setToken')
  }
})

export default {
  namespaced: true,
  state,
  actions
}
