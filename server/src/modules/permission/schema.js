
const gql = String.raw

export const types = gql`
  type Permission {
    id: ID! @unique
    user: User!
    accessType: PermissionAccessType!
    accessLevel: PermissionAccessLevel!
  }
  
  enum PermissionAccessType {
    CREATE_USER
    READ_USER
    UPDATE_USER
  }

  enum PermissionAccessLevel {
    NONE #no access 0
    OWNER #access owner only 1
    ALL #access all of a collection 2
    SUPER #super user who cannot be tampered with 3
  }
`

export const queries = gql`
`

export const mutations = gql`
`
