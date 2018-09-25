import { Cookies, extend } from 'quasar'
import jwt from 'jsonwebtoken'
import gql from 'graphql-tag'

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
        expire: '', // TODO: Set expiration to match token
        domain: window.location.hostname,
        secure: process.env.PROD // require https on production
      })
    } else {
      state.token = null
      state.decodedToken = null

      Cookies.remove('token')
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
        variables: state.decodedToken.user,
        query: gql`
          query($id: ID!) {
            getUser(id: $id){
              id
              username
              email
              firstName
              lastName
              permissions{
                create_user
                read_user
                update_user
              }
            }
          }
        `
      })

      commit('setUser', response.data.getUser)
    }
  },

  async register ({ commit }, form) {
    await this._vm.$apollo.mutate({
      variables: form,
      mutation: gql`
        mutation RegisterUser($username: String!, $email: String!, $password: String!) {
          registerUser(username: $username, email: $email, password: $password)
        }
      `
    })
  },

  async verify ({ commit }, token) {
    commit('setToken', token)

    await this._vm.$apollo.mutate({
      mutation: gql`
        mutation verifyEmail {
          verifyEmail
        }
      `
    })
  },

  async forgotPassword ({ commit }, form) {
    await this._vm.$apollo.query({
      variables: form,
      query: gql`
        query($email: String!) {
          forgotPassword(email: $email)
        }
      `
    })
  },

  async login ({ commit }, form) {
    const response = await this._vm.$apollo.query({
      variables: form,
      query: gql`
        query($username: String!, $password: String!) {
          authenticateUser(username: $username, password: $password)
        }
      `
    })

    commit('setToken', response.data.authenticateUser)
  },

  async logout ({ commit }) {
    commit('setToken')
  },

  async refreshToken ({ commit }) {
    const response = await this._vm.$apollo.query({
      query: gql`
        query {
          refreshToken
        }
      `
    })

    if (response.data) {
      await commit('setToken', response.data.refreshToken)
    } else {
      throw new Error(response.errors[0].message)
    }
  }
})

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
