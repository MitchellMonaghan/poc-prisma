import { merge } from 'lodash'
import { loadModules } from '@services/moduleLoader'

const moduleResolvers = loadModules('./src/graphql/modules', 'resolvers')

const resolvers = {}
Object.keys(moduleResolvers).forEach(resolverKey => {
  const resolver = moduleResolvers[resolverKey]
  merge(resolvers, resolver.default)
})

export {
  resolvers
}
