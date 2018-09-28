import config from '@config'
import { AuthenticationError } from 'apollo-server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { pick } from 'lodash'
import { errorText } from '@services/joi'

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

    const user = await prisma.query.user({
      where: { id: decoded.user.id }
    }, `{
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
    }`)

    jwt.verify(token, `${config.authSecret}`)

    if (decoded.user.lastPasswordChange !== user.lastPasswordChange) {
      throw new AuthenticationError(errorText.authenticationError())
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
