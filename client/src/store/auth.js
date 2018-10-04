import { Cookies, extend } from 'quasar'
import jwt from 'jsonwebtoken'

import {
  authenticateUserQuery,
  forgotPasswordQuery,
  refreshTokenQuery,
  getUserQuery
} from 'src/graphql/queries'

import {
  registerUserMutation,
  verifyEmailMutation,
  changePasswordMutation
} from 'src/graphql/mutations'

const state = extend({}, {
  user: null,
  token: null,
  decodedToken: null
})

const mutations = extend({}, {
  setUser (state, user) {
    if (user) {
      state.user = user
    } else {
      state.user = null
    }
  },

  setToken (state, token) {
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
  }
})

const actions = extend({}, {
  async getCurrentUser ({commit}) {
    // Get token
    const token = Cookies.get('token')

    if (token) {
      await commit('setToken', token)

      // Request user from server
      const response = await this._vm.$apollo.query({
        variables: { where: { id: state.decodedToken.user.id } },
        query: getUserQuery
      })

      commit('setUser', response.data.user)
    }
  },

  async register ({ commit }, form) {
    await this._vm.$apollo.mutate({
      variables: form,
      mutation: registerUserMutation
    })
  },

  async verify ({ commit }, token) {
    commit('setToken', token)

    await this._vm.$apollo.mutate({
      mutation: verifyEmailMutation
    })
  },

  async forgotPassword ({ commit }, form) {
    await this._vm.$apollo.query({
      variables: form,
      query: forgotPasswordQuery
    })
  },

  async login ({ commit }, form) {
    const response = await this._vm.$apollo.query({
      variables: form,
      query: authenticateUserQuery
    })

    commit('setToken', response.data.authenticateUser)
  },

  async logout ({ commit }) {
    await this._vm.$apollo.resetStore()
    commit('setToken')
  },

  async refreshToken ({ commit }) {
    const response = await this._vm.$apollo.query({
      query: refreshTokenQuery
    })

    await commit('setToken', response.data.refreshToken)
  },

  async changePassword ({ commit }, form) {
    const response = await this._vm.$apollo.mutate({
      variables: form,
      mutation: changePasswordMutation
    })

    commit('setToken', response.data.changePassword)
  }
})

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
