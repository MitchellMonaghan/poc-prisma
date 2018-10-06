import { extend } from 'quasar'
import { findIndex } from 'lodash'

const state = extend({}, {
  notifications: []
})

const actions = extend({}, {
  upsertNotifications ({state}, newNotifications) {
    newNotifications = Array.isArray(newNotifications) ? newNotifications : [newNotifications]

    const toBeAppendedToFront = []

    newNotifications.forEach(notification => {
      const notificationIndex = findIndex(state.notifications, { id: notification.id })

      if (notificationIndex >= 0) {
        state.notifications[notificationIndex] = notification
      } else {
        toBeAppendedToFront.push(notification)
      }
    })

    state.notifications = toBeAppendedToFront.concat(state.notifications)
  }
})

export default {
  namespaced: true,
  state,
  actions
}
