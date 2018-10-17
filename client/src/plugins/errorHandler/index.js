import { getError, getErrorCode } from './errorHelper'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  Vue.prototype.$getError = getError
  Vue.prototype.$getErrorCode = getErrorCode
}
