import { extend } from 'quasar'
import { findIndex, filter } from 'lodash'

const notificationTypes = {
  WELCOME: 'WELCOME',
  INVITE_ACCEPTED: 'INVITE_ACCEPTED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  USER_SETTINGS_UPDATED: 'USER_SETTINGS_UPDATED',
  PLEASE_CHANGE_YOUR_PASSWORD: 'PLEASE_CHANGE_YOUR_PASSWORD'
}

const state = extend({}, {
  notifications: []
})

const getters = extend({}, {
  notifications: state => state.notifications.map((notification) => {
    notification.icon = 'settings'

    switch (notification.notificationType) {
      case notificationTypes.WELCOME:
        break
      case notificationTypes.INVITE_ACCEPTED:
        notification.icon = 'fa fa-users'
        break
      case notificationTypes.PASSWORD_CHANGED:
        notification.icon = 'fa fa-lock'
        break
      case notificationTypes.USER_SETTINGS_UPDATED:
        notification.linkTo = { name: 'settings' }
        break
      case notificationTypes.PLEASE_CHANGE_YOUR_PASSWORD:
        notification.icon = 'fa fa-lock'
        notification.linkTo = { name: 'changePassword' }
        break
    }

    return notification
  })
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
  getters,
  actions
}
