import isAuthenticated from './isAuthenticated'
import requiresPermission from './requiresPermission'
import usePermissions from './usePermissions'
import protectedField from './protected'

const publicProps = {
  isAuthenticated,
  requiresPermission,
  usePermissions,
  protected: protectedField
}

module.exports = publicProps
export default publicProps
