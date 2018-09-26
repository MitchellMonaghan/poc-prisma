// import isAuthenticated from './isAuthenitcated'
// import hasPermission from './hasPermission'
import { AuthenticationError } from 'apollo-server'

const isAuthenticated = async (next, source, args, context) => {
  const { user } = context

  if (user) {
    return next()
  }

  throw new AuthenticationError('Token invalid please authenticate.')
}

const hasPermission = async (next, source, args, context) => {
  console.log('TODO: Write/Port over is hasPermission directive')
  return next()
}

const publicProps = {
  isAuthenticated,
  hasPermission
}

module.exports = publicProps
export default publicProps
