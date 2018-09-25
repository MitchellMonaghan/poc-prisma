import { loadModules } from '@services/moduleLoader'

const schemas = loadModules('./src/modules', 'schema')

const types = []
const queries = []
const mutations = []
const subscriptions = []

Object.keys(schemas).forEach((schemaKey) => {
  const schema = schemas[schemaKey]

  types.push(schema.types)
  queries.push(schema.queries)
  mutations.push(schema.mutations)
  subscriptions.push(schema.subscriptions)
})

export default `
  ${types.join('\n')}

  type Query {
    ${queries.join('\n')}
  }

  type Mutation {
    ${mutations.join('\n')}
  }

  type Subscription {
    ${subscriptions.join('\n')}
  }
`
