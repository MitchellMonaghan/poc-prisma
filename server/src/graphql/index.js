import config from '@config'
import { parse } from 'graphql'
import { importSchema } from 'graphql-import'
import { ApolloServer, makeExecutableSchema } from 'apollo-server'
import { Prisma, extractFragmentReplacements } from 'prisma-binding'
import { get, merge } from 'lodash'

import { getUserFromToken } from '@services/jwt'
import { verifyEmail } from '@modules/auth/manager'
import { addFragmentToFieldResolvers } from '@modules/permission/manager'

import { resolvers as rootResolvers } from './resolvers'
import schemaDirectives from './directives'

const typeDefs = importSchema('./src/graphql/schema/schema.graphql')
const dataModel = importSchema('./src/graphql/schema/dataModel.graphql')

const preparedResolvers = addFragmentToFieldResolvers(parse(dataModel))
const resolvers = merge(rootResolvers, { ...preparedResolvers })
const fragmentReplacements = extractFragmentReplacements(preparedResolvers)

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives
})

const graphqlServer = new ApolloServer({
  schema,
  context: async ({ req, connection }) => {
    let context = get(connection, 'context') || { authToken: get(req, 'headers.authorization') }
    context.prisma = new Prisma({
      fragmentReplacements,
      typeDefs: 'src/graphql/generated/prisma.graphql',
      endpoint: config.prismaUrl,
      secret: config.prismaSecret,
      debug: config.env !== 'production'
    })

    if (context.authToken) {
      context.user = await getUserFromToken(context.prisma, context.authToken)

      // Only do this check if a real user token was provided
      if (context.user) {
        // If the user is not confirmed they are only allowed to
        // access the verifyEmail query as authenticated
        let accessingVerifyEmail = (get(req, 'body.query') || '').includes(verifyEmail.name)
        context.user = context.user.confirmed || (!context.user.confirmed && accessingVerifyEmail) ? context.user : null
      }
    }

    return context
  },
  subscriptions: {
    onConnect: async (connectionParams, webSocket, context) => {
      context.authToken = connectionParams.authorization || connectionParams.Authorization
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
