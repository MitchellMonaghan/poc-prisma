import isAuthenticated from './isAuthenticated'
import hasPermission from './hasPermission'
import protectedField from './protected'

const publicProps = {
  isAuthenticated,
  hasPermission,
  protected: protectedField
}

module.exports = publicProps
export default publicProps
