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
    `
  }

  return {
    // Queries
    getUser: async (variables) => {
      const response = await apollo.query({
        variables,
        query: queries.getUser
      })

      // add user to loaded users store
      // vue.$store.dispatch('auth/setUser', response.data.user)

      return response
    }

    // Mutations

    // Subscription
  }
}

export default init
