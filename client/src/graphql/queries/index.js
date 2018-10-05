import gql from 'graphql-tag'

const authenticateUserQuery = gql`
  query($username: String!, $password: String!) {
    authenticateUser(username: $username, password: $password)
  }
`

const forgotPasswordQuery = gql`
  query($email: String!) {
    forgotPassword(email: $email)
  }
`

const refreshTokenQuery = gql`
  query {
    refreshToken
  }
`

const getUserQuery = gql`
  query($where: UserWhereUniqueInput!) {
    user(where: $where) {
      id
      username
      email
      firstName
      lastName
      permissions {
        accessType
        accessLevel
      }
    }
  }
`

const getNotificationsQuery = gql`
  query($where: NotificationWhereInput!) {
    notifications(where: $where) {
      id
      message
      viewed
    }
  }
`

export {
  authenticateUserQuery,
  forgotPasswordQuery,
  refreshTokenQuery,
  getUserQuery,
  getNotificationsQuery
}
