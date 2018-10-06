import { Cookies } from 'quasar'
import gql from 'graphql-tag'
import user from 'src/graphql/user'

const init = (apollo, store) => {
  const { getUser } = user(apollo, store)

  const queries = {
    authenticateUser: gql`
      query($username: String!, $password: String!) {
        authenticateUser(username: $username, password: $password)
      }
    `,
    forgotPassword: gql`
      query($email: String!) {
        forgotPassword(email: $email)
      }
    `,
    refreshToken: gql`
      query {
        refreshToken
      }
    `
  }

  const mutations = {
    registerUser: gql`
      mutation registerUser($username: String!, $email: String!, $password: String!) {
        registerUser(username: $username, email: $email, password: $password)
      }
    `,
    verifyEmail: gql`
      mutation verifyEmail {
        verifyEmail
      }
    `,
    changePassword: gql`
      mutation changePassword($id: ID!, $password: String!) {
        changePassword(id: $id, password: $password)
      }
    `
  }

  return {
    // Queries
    login: async (variables) => {
      const response = await apollo.query({
        variables,
        query: queries.authenticateUser
      })

      await store.dispatch('auth/setToken', response.data.authenticateUser)
    },

    forgotPassword: async (variables) => {
      await apollo.query({
        variables,
        query: queries.forgotPassword
      })
    },

    refreshToken: async () => {
      const response = await apollo.query({
        query: queries.refreshToken
      })

      await store.dispatch('auth/setToken', response.data.refreshToken)
    },

    getCurrentUser: async () => {
      const token = Cookies.get('token')

      if (token) {
        await store.dispatch('auth/setToken', token)

        const response = await getUser({ where: { id: store.state.auth.decodedToken.user.id } })
        await store.dispatch('auth/setUser', response.data.user)
      }
    },

    // Mutations
    registerUser: async (variables) => {
      await apollo.mutate({
        variables,
        mutation: mutations.registerUser
      })
    },

    verifyEmail: async (token) => {
      store.dispatch('auth/setToken', token)

      await apollo.mutate({
        mutation: mutations.verifyEmail
      })
    },

    changePassword: async (variables) => {
      const response = await apollo.mutate({
        variables,
        mutation: mutations.changePassword
      })

      store.dispatch('auth/setToken', response.data.changePassword)
    }
  }
}

export default init
