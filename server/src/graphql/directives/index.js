// import isAuthenticated from './isAuthenitcated'
// import hasPermission from './hasPermission'

const isAuthenticated = async (next, source, args, context) => {
  console.log('TODO: Write/Port over is authenticated directive')
  return next()
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
