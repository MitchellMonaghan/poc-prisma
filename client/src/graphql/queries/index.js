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
  query($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
      firstName
      lastName
      permissions{
        create_user
        read_user
        update_user
      }
    }
  }
`

export {
  authenticateUserQuery,
  forgotPasswordQuery,
  refreshTokenQuery,
  getUserQuery
}
