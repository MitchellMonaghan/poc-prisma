import { Cookies } from 'quasar'
import { ApolloClient } from 'apollo-client'
import { split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { getMainDefinition } from 'apollo-utilities'

import store from 'src/store'
const vuexStore = store()

export default ({ Vue }) => {
  const httpLink = new HttpLink({
    uri: process.env.API_URL,
    fetch: async (uri, options) => {
      if (vuexStore.state.auth.token) {
        options.headers.authorization = vuexStore.state.auth.token
      }

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
    uri: process.env.WEB_SOCKET_URL,
    options: {
      reconnect: true,
      connectionParams: {
        authorization: Cookies.get('token')
      }
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
    connectToDevTools: true
  })

  Vue.prototype.$apollo = apolloClient
}
