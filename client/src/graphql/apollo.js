import { Cookies } from 'quasar'
import { ApolloClient } from 'apollo-client'
import { split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { getMainDefinition } from 'apollo-utilities'

import graphql from 'src/graphql'

const httpLink = new HttpLink({
  uri: process.env.API_URL,
  fetch: async (uri, options) => {
    if (graphql.store.state.auth.token) {
      options.headers.authorization = graphql.store.state.auth.token
    }

    if (graphql.store.state.auth.decodedToken) {
      const issuedDate = new Date(graphql.store.state.auth.decodedToken.iat * 1000)
      const expirationDate = new Date(graphql.store.state.auth.decodedToken.exp * 1000)

      const halfLife = new Date((issuedDate.getTime() + expirationDate.getTime()) / 2)

      if (halfLife <= Date.now() && !options.body.includes('refreshToken')) {
        try {
          await graphql.auth.refreshToken()
          options.headers.authorization = graphql.store.state.auth.token
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

const subscriptionMiddleware = {
  applyMiddleware: async (options, next) => {
    options.authToken = graphql.store.state.auth.token
    next()
  }
}

wsLink.subscriptionClient.use([subscriptionMiddleware])

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

export default apolloClient
