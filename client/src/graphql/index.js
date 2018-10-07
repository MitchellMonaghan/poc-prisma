import auth from './auth'
import notification from './notification'
import permission from './permission'
import user from './user'

import apollo from './apollo'
import store from 'src/store'
const vuexStore = store()

export default {
  apollo,
  store: vuexStore,
  auth: auth(apollo, vuexStore),
  notification: notification(apollo, vuexStore),
  permission: permission(apollo, vuexStore),
  user: user(apollo, vuexStore)
}
