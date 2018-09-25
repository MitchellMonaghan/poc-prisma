import { ApolloClient } from 'apollo-client'

import { split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

import { InMemoryCache } from 'apollo-cache-inmemory'
import store from 'src/store'

const vuexStore = store()

export default ({ Vue }) => {
  const httpLink = new HttpLink({
    uri: '/graphql',
    fetch: async (uri, options) => {
      options.headers.authorization = vuexStore.state.auth.token

      if (vuexStore.state.auth.decodedToken) {
        const issuedDate = new Date(vuexStore.state.auth.decodedToken.iat * 1000)
        const expirationDate = new Date(vuexStore.state.auth.decodedToken.exp * 1000)

        const halfLife = new Date((issuedDate.getTime() + expirationDate.getTime()) / 2)

        if (halfLife <= Date.now() && !options.body.includes('refreshToken')) {
          try {
            await vuexStore.dispatch('auth/refreshToken')
            options.headers.authorization = vuexStore.state.auth.token
          } catch (error) {
            console.log(error)
          }
        }
      }

      return fetch(uri, options)
    }
  })

  const wsLink = new WebSocketLink({
    uri: `ws://localhost:4000/subscriptions`,
    options: {
      reconnect: true
    }
  })

  const link = split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query)
      return kind === 'OperationDefinition' && operation === 'subscription'
    },
    wsLink,
    httpLink
  )

  // Create the apollo client
  const apolloClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
    connectToDevTools: true,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only',
        errorPolicy: 'ignore'
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all'
      }
    }
  })

  Vue.prototype.$apollo = apolloClient
}
