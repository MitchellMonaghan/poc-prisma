import config from '@config'
import graphqlServer from '@graphql'

graphqlServer.listen({ port: config.port }).then(({ url, subscriptionsUrl }) => {
  console.log(`🚀  Server ready at ${url}graphql`)
  console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`)
})
