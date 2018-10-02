import { ApolloClient } from 'apollo-client'
import VueApollo from 'vue-apollo'
import { split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { getMainDefinition } from 'apollo-utilities'

export default ({ Vue }) => {
  const httpLink = new HttpLink({
    uri: '/graphql',
    fetch: async (uri, options) => {
      // TODO: Check if token is valid and request a new token if it is not
      // or request a new token if token is past half life

      return fetch(uri, options)
    }
  })

  const wsLink = new WebSocketLink({
    uri: `ws://localhost:8080/graphql`,
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
    connectToDevTools: true
  })

  const apolloProvider = new VueApollo({
    defaultClient: apolloClient
  })

  Vue.prototype.$apollo = apolloProvider
}
