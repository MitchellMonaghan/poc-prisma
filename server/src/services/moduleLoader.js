import fs from 'fs'
import path from 'path'

// Private functions
const trimExtension = (moduleName) => {
  return moduleName.replace(/\.[^/.]+$/, '')
}
// End private functions

// Public functions
const loadModules = (folderPath, fileName) => {
  const moduleNames = fs.readdirSync(folderPath)

  const modules = {}

  moduleNames.forEach((moduleName) => {
    try {
      const modulePath = path.join(process.cwd(), folderPath, moduleName, fileName)
      modules[trimExtension(moduleName)] = require(modulePath)
    } catch (error) {
      console.log(error)
    }
  })

  return modules
}

const loadFolder = (folderPath) => {
  const modules = {}

  const moduleNames = fs.readdirSync(folderPath)

  moduleNames.forEach((moduleName) => {
    modules[trimExtension(moduleName)] = require(path.join(folderPath, moduleName))
  })

  return modules
}
// End public functions
const publicProps = {
  loadModules,
  loadFolder
}

module.exports = publicProps
export default publicProps
