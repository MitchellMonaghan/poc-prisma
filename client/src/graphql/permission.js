import gql from 'graphql-tag'

const init = (apollo, store) => {
  const mutations = {
    updatePermission: gql`
      mutation updatePermission($where: PermissionWhereUniqueInput!, $data: PermissionUpdateInput!) {
        updatePermission(where: $where, data: $data) {
          id
          user {
            id
          }
          accessType
          accessLevel
        }
      }
    `
  }

  const subscriptions = {
    permission: gql`
      subscription($where: PermissionSubscriptionWhereInput!) {
        permission(where: $where) {
          node {
            id
            user {
              id
            }
            accessType
            accessLevel
          }
        }
      }
    `
  }

  return {
    // Queries

    // Mutations
    updatePermission: async (userId, accessType, accessLevel) => {
      const response = await apollo.mutate({
        variables: {
          where: { user: { id: userId }, accessType },
          data: {
            accessLevel
          }
        },
        mutation: mutations.updatePermission
      })

      await store.dispatch('auth/updatePermission', response.data.permission)
    },

    // Subscription
    subscribeToPermissions: async (userId) => {
      await apollo.subscribe({
        variables: {
          where: {
            node: { user: { id: userId } }
          }
        },
        query: subscriptions.permission
      }).subscribe({
        async next (response) {
          await store.dispatch('auth/updatePermission', response.data.permission.node)
        },
        async error (error) {
          console.log(error)
        }
      })
    }
  }
}

export default init
