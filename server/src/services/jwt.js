import config from '@config'
import { AuthenticationError } from 'apollo-server'
import jwt from 'jsonwebtoken'
import { pick } from 'lodash'

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
    // const user = await User.findById(decoded.user.id).exec()
    const user = await prisma.query.user({
      where: { id: decoded.user.id }
    })

    jwt.verify(token, `${config.authSecret}`)

    if (decoded.user.lastPasswordChange !== user.lastPasswordChange) {
      throw new AuthenticationError('Token invalid please authenticate.')
    }

    return user
  } catch (error) {
    return null
  }
}

const publicProps = {
  generateJWT,
  getUserFromToken
}

module.exports = publicProps
export default publicProps
