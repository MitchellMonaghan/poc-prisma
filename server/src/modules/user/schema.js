
const gql = String.raw

export const types = gql`
  type User {
    id: ID
    username: String
    firstName: String @hasPermission(permission: "update_user", value: "owner")
    lastName: String @hasPermission(permission: "update_user", value: "owner")
    email: String @hasPermission(permission: "update_user", value: "owner")
    permissions: Permissions
  }
`

export const queries = gql`
  "Gets all users from the system"
  getUsers: [User] @hasPermission(permission: "read_user", value: "all")

  "Gets a single user specified by the id provided"
  getUser(id: ID!): User @hasPermission(permission: "read_user", value: "owner")
`

export const mutations = gql`
  updateUser(id: ID!, username: String!, firstName: String, lastName: String): User @hasPermission(permission: "update_user", value: "owner")
  deleteUser(id: ID!): User @hasPermission(permission: "update_user", value: "owner")
`

export const subscriptions = gql`
  userUpdated: User @hasPermission(permission: "read_user", value: "owner")
`
