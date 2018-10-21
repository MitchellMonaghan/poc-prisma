import config from '@config'
import { parse } from 'graphql'
import { importSchema } from 'graphql-import'
import { ApolloServer, makeExecutableSchema } from 'apollo-server'
import { Prisma, extractFragmentReplacements } from 'prisma-binding'
import { get, merge } from 'lodash'
import jwt from 'jsonwebtoken'
import { CronJob } from 'cron'

import { getUserFromToken } from '@services/jwt'
import { verifyEmail } from '@modules/auth/manager'
import { addFragmentToFieldResolvers } from '@modules/permission/manager'

import { resolvers as rootResolvers } from './resolvers'
import * as schemaDirectives from './directives'

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
  context: async ({ req, connection, payload }) => {
    let context = get(connection, 'context') || { authToken: get(req, 'headers.authorization') }
    context.authToken = context.authToken || get(payload, 'authToken')

    context.prisma = new Prisma({
      fragmentReplacements,
      typeDefs: 'src/graphql/generated/prisma.graphql',
      endpoint: config.prismaUrl,
      secret: config.prismaSecret
    })

    if (context.authToken) {
      context.decodedToken = jwt.decode(context.authToken)
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
  engine: {
    apiKey: config.apolloEngineAPIKey
  }
})

// Cron jobs
// depending on how this is deployed this might not be needed and should be
// executed by something like https://elements.heroku.com/addons/scheduler
const cleanUpNotificationsJob = new CronJob('0 */5 * * * *', async () => {
  const prisma = new Prisma({
    typeDefs: 'src/graphql/generated/prisma.graphql',
    endpoint: config.prismaUrl,
    secret: config.prismaSecret
  })

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const notifications = await prisma.query.notifications({ where: { createdAt_lt: oneWeekAgo } })

  notifications.forEach(notification => {
    prisma.mutation.deleteNotification({ where: { id: notification.id } })
  })
})

cleanUpNotificationsJob.start()

module.exports = graphqlServer
export default graphqlServer
