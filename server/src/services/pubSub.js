import config from '@config'

import { RedisPubSub } from 'graphql-redis-subscriptions'

export default new RedisPubSub({
  connection: {
    host: config.redisDomainName,
    port: config.redisPortNumber,
    password: config.redisPassword,
    retry_strategy: options => {
      // reconnect after
      return Math.max(options.attempt * 100, 3000)
    }
  }
})
