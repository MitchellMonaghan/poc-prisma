import config from '@config'
import { AuthenticationError } from 'apollo-server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { pick } from 'lodash'

const hashPassword = async (password) => {
  const saltRounds = 10
  const salt = bcrypt.genSaltSync(saltRounds)
  return bcrypt.hashSync(password, salt)
}

const generateJWT = async (user) => {
  const props = Object.assign({}, {
    user: pick(user, ['id', 'username', 'email', 'firstName', 'lastName', 'lastPasswordChange'])
  })

  // Sign token with a combination of authSecret and user password
  // This way both the server and the user has the ability to invalidate all tokens
  return jwt.sign(props, `${config.authSecret}`, { expiresIn: config.tokenExipresIn })
}

const getUserFromToken = async (prisma, token) => {
  try {
    const decoded = jwt.decode(token)
    const query = `
      query ($userId: ID!){
        user(where: { id: $userId }) {
          id
          firstName
          lastName
          username
          email
          password
          lastPasswordChange
          confirmed
          permissions {
            accessType
            accessLevel
          }

          deleted
        }
      }
    `

    const prismaResponse = await prisma.request(query, { userId: decoded.user.id })
    const { user } = prismaResponse.data

    jwt.verify(token, `${config.authSecret}`)

    if (decoded.user.lastPasswordChange !== user.lastPasswordChange) {
      throw new AuthenticationError('Token invalid please authenticate.')
    }

    return user
  } catch (error) {
    console.log(error)
    return null
  }
}

const publicProps = {
  hashPassword,
  generateJWT,
  getUserFromToken
}

module.exports = publicProps
export default publicProps
