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

export {
  registerUserMutation,
  verifyEmailMutation
}
