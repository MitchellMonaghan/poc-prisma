import config from '@config'
import { importSchema } from 'graphql-import'
import { ApolloServer, makeExecutableSchema } from 'apollo-server'
import { Prisma } from 'prisma-binding'
import { get } from 'lodash'

import { getUserFromToken } from '@services/jwt'
import { verifyEmail } from '@modules/auth/manager'

import resolvers from './resolvers'
import schemaDirectives from './directives'
const typeDefs = importSchema('./src/graphql/schema.graphql')

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives
})

const graphqlServer = new ApolloServer({
  schema,
  context: async ({ req, connection }) => {
    let context = get(connection, 'context') || {}
    context.prisma = new Prisma({
      typeDefs: 'src/graphql/generated/prisma.graphql',
      endpoint: process.env.PRISMA_URL
    })

    if (get(req, 'headers.authorization')) {
      let authToken = req.headers.authorization

      if (authToken) {
        context.user = await getUserFromToken(context.prisma, authToken)

        // Only do this check if a real user token was provided
        if (context.user) {
          // If the user is not confirmed they are only allowed to
          // access the verifyEmail query as authenticated
          let accessingVerifyEmail = req.body.query.includes(verifyEmail.name)
          context.user = context.user.confirmed || (!context.user.confirmed && accessingVerifyEmail) ? context.user : null
        }
      }
    }

    return context
  },
  subscriptions: {
    onConnect: async (connectionParams, webSocket, context) => {
      if (connectionParams.authorization) {
        let user = await getUserFromToken(connectionParams.authorization)
        user = get(user, 'confirmed') ? user : null
        context.user = user
      }

      return context
    },

    onDisconnect: async (webSocket, context) => {
      console.log('disconnected')
      // ...
    }
  },
  engine: {
    apiKey: config.apolloEngineAPIKey
  }
})

module.exports = graphqlServer
export default graphqlServer
