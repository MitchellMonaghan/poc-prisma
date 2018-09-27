const rootObjectsEnum = {
  query: 'Query',
  mutation: 'Mutation',
  subscription: 'Subscription'
}

const isRootObject = (parentTypeName) => {
  return parentTypeName === rootObjectsEnum.query || parentTypeName === rootObjectsEnum.mutation || parentTypeName === rootObjectsEnum.subscription
}

const publicProps = {
  rootObjectsEnum,
  isRootObject
}

module.exports = publicProps
export default publicProps
