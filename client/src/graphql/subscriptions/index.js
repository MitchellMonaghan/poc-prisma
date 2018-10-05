import gql from 'graphql-tag'

const notificationSubscription = gql`
  subscription($where: NotificationSubscriptionWhereInput!) {
    notification(where: $where) {
      node {
        id
        message
        viewed
      }
    }
  }
`

export {
  notificationSubscription
}
