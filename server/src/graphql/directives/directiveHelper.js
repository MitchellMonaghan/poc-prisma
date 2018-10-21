const rootObjectsEnum = {
  query: 'Query',
  mutation: 'Mutation',
  subscription: 'Subscription'
}

const isRootObject = (parentTypeName) => {
  return parentTypeName === rootObjectsEnum.query || parentTypeName === rootObjectsEnum.mutation || parentTypeName === rootObjectsEnum.subscription
}

export {
  rootObjectsEnum,
  isRootObject
}
