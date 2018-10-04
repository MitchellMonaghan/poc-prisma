import gql from 'graphql-tag'

const notificationSubscription = gql`
  subscription($where: NotificationSubscriptionWhereInput!) {
    notification(where: $where) {
      node {
        message
        viewed
      }
    }
  }
`

export {
  notificationSubscription
}
