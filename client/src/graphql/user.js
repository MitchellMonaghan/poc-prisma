import gql from 'graphql-tag'

const init = (apollo, store) => {
  const queries = {
    getUser: gql`
      query($where: UserWhereUniqueInput!) {
        user(where: $where) {
          id
          username
          email
          firstName
          lastName
          permissions {
            accessType
            accessLevel
          }
        }
      }
    `,

    getUsers: gql`
      query($where: UserWhereInput!) {
        users(where: $where) {
          id
          username
          email
          firstName
          lastName
          permissions {
            accessType
            accessLevel
          }
        }
      }
    `
  }

  const mutations = {
    updateUser: gql`
      mutation updateUser($where: UserWhereUniqueInput!, $data: UserUpdateInput!) {
        updateUser(where: $where, data: $data) {
          id
          username
          email
          firstName
          lastName
          permissions {
            accessType
            accessLevel
          }
        }
      }
    `
  }

  const subscriptions = {
    user: gql`
      subscription($where: UserSubscriptionWhereInput!) {
        user(where: $where) {
          node {
            id
            username
            email
            firstName
            lastName
            permissions {
              accessType
              accessLevel
            }
          }
        }
      }
    `
  }

  return {
    // Queries
    getUser: async (variables) => {
      const response = await apollo.query({
        variables,
        query: queries.getUser
      })

      store.dispatch('user/upsertUsers', response.data.user)

      return response
    },

    getUsers: async (userId) => {
      const response = await apollo.query({
        variables: { where: { createdBy: { id: userId } } },
        query: queries.getUsers
      })

      store.dispatch('user/upsertUsers', response.data.notifications)
    },

    // Mutations
    updateUser: async (userId, data) => {
      const response = await apollo.mutate({
        variables: {
          where: { id: userId },
          data
        },
        mutation: mutations.updateUser
      })

      if (userId === store.state.auth.user.id) {
        await store.dispatch('auth/setUser', response.data.updateUser)
      }

      await store.dispatch('user/upsertUsers', response.data.updateUser)
    },

    // Subscription
    subscribeToUsers: async (userId) => {
      await apollo.subscribe({
        variables: {
          where: {
            node: { id: userId }
          }
        },
        query: subscriptions.user
      }).subscribe({
        async next (response) {
          if (userId === store.state.auth.user.id) {
            await store.dispatch('auth/setUser', response.data.user.node)
          }

          await store.dispatch('user/upsertUsers', [response.data.user.node])
        },
        async error (error) {
          console.log(error)
        }
      })
    }
  }
}

export default init
