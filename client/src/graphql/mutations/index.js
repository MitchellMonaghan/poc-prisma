import gql from 'graphql-tag'

const registerUserMutation = gql`
  mutation registerUser($username: String!, $email: String!, $password: String!) {
    registerUser(username: $username, email: $email, password: $password)
  }
`

const verifyEmailMutation = gql`
  mutation verifyEmail {
    verifyEmail
  }
`

const changePasswordMutation = gql`
  mutation changePassword($id: ID!, $password: String!) {
    changePassword(id: $id, password: $password)
  }
`

const updateNotificationMutation = gql`
  mutation updateNotification($where: NotificationWhereUniqueInput!, $data: NotificationUpdateInput!) {
    updateNotification(where: $where, data: $data) {
      id
      message
      viewed
    }
  }
`

export {
  registerUserMutation,
  verifyEmailMutation,
  changePasswordMutation,
  updateNotificationMutation
}
