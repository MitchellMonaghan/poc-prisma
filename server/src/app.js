import config from '@config'
import graphqlServer from '@services/graphql'

graphqlServer.listen({ port: config.port }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
