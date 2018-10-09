import { extend } from 'quasar'
import { findIndex, filter } from 'lodash'

const state = extend({}, {
  notifications: []
})

const actions = extend({}, {
  deleteNotification ({state}, notificationId) {
    // TODO: Theres a bug in prisma currently where delete subscriptions return the wrong value for id
    // Issue can be viewed here https://github.com/prisma/prisma/issues/2847
    notificationId = notificationId.replace('CuidGCValue(', '').replace(')', '')
    state.notifications = filter(state.notifications, (notification) => notification.id !== notificationId)
  },

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
