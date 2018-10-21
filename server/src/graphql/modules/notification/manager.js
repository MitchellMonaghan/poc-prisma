import { Joi } from '@services/joi'
import { pick } from 'lodash'
import * as mailer from '@services/mailer'

import { checkPermissionsAndProtectedFields } from '@modules/permission/manager'
import { getUserDisplayName } from '@modules/user/manager'

const notificationTypes = {
  WELCOME: 'WELCOME',
  INVITE_ACCEPTED: 'INVITE_ACCEPTED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  USER_SETTINGS_UPDATED: 'USER_SETTINGS_UPDATED',
  PLEASE_CHANGE_YOUR_PASSWORD: 'PLEASE_CHANGE_YOUR_PASSWORD'
}

const welcomeNotification = async (root, args, context, info) => {
  const {
    recipient
  } = args

  const welcomeNotificationData = {
    recipient,
    notificationType: notificationTypes.WELCOME
  }

  createNotification(root, welcomeNotificationData, context, info)
}

const inviteAcceptedNotification = async (root, args, context, info) => {
  const { inviter, invitee } = args
  const inviteeDisplayName = await getUserDisplayName(invitee)

  const inviteAcceptedNotificationData = {
    recipient: inviter,
    notificationType: notificationTypes.INVITE_ACCEPTED,
    data: JSON.stringify({
      invitee: inviteeDisplayName
    }),
    mailerArgs: [mailer.emailEnum.inviteAccepted, [inviter.email], { invitee, inviter }]
  }

  createNotification(root, inviteAcceptedNotificationData, context, info)
}

const passwordChangedNotification = async (root, args, context, info) => {
  const { recipient } = args

  const passwordChangedNotificationData = {
    recipient,
    notificationType: notificationTypes.PASSWORD_CHANGED,
    mailerArgs: [mailer.emailEnum.passwordChanged, [recipient.email], recipient]
  }

  createNotification(root, passwordChangedNotificationData, context, info)
}

const userSettingsUpdatedNotification = async (root, args, context, info) => {
  const { recipient } = args

  const userSettingsUpdatedNotificationData = {
    recipient,
    notificationType: notificationTypes.USER_SETTINGS_UPDATED,
    mailerArgs: [mailer.emailEnum.userSettingsUpdated, [recipient.email], recipient]
  }

  createNotification(root, userSettingsUpdatedNotificationData, context, info)
}

const pleaseChangeYourPasswordNotification = async (root, args, context, info) => {
  const { recipient } = args

  const pleaseChangeYourPasswordNotificationData = {
    recipient,
    notificationType: notificationTypes.PLEASE_CHANGE_YOUR_PASSWORD
  }

  createNotification(root, pleaseChangeYourPasswordNotificationData, context, info)
}

const createNotification = async (root, args, context, info) => {
  const { prisma } = context
  const { notificationType, data, recipient, mailerArgs } = args

  await prisma.mutation.createNotification({
    data: {
      notificationType,
      data,
      createdBy: { connect: { id: recipient.id } }
    }
  })

  if (recipient.receiveEmailNotifications && mailerArgs) {
    mailer.sendEmail(...mailerArgs)
  }
}

const getNotifications = async (root, args, context, info) => {
  const { prisma } = context
  return prisma.query.notifications(args, info)
}

const updateNotification = async (root, args, context, info) => {
  const { prisma } = context
  const { where } = args
  const data = pick(args.data, 'viewed')

  const whereSchemaValidation = {
    id: Joi.string().required()
  }

  const dataSchemaValidation = {
    viewed: Joi.boolean().required()
  }

  Joi.validate(where, whereSchemaValidation)
  Joi.validate(data, dataSchemaValidation)

  const notificationToBeUpdated = await prisma.query.notification({
    where
  }, info)

  await checkPermissionsAndProtectedFields(notificationToBeUpdated, args, context, info)

  let updatedNotification = await prisma.mutation.updateNotification({
    where,
    data
  }, info)

  return updatedNotification
}

const deleteNotification = async (root, args, context, info) => {
  const { prisma } = context
  const { where } = args

  const whereSchemaValidation = {
    id: Joi.string().required()
  }

  Joi.validate(where, whereSchemaValidation)

  const notificationToBeDeleted = await prisma.query.notification({
    where
  }, info)

  await checkPermissionsAndProtectedFields(notificationToBeDeleted, args, context, info)

  await prisma.mutation.deleteNotification({
    where
  }, '{ id }')

  return notificationToBeDeleted
}

export {
  welcomeNotification,
  inviteAcceptedNotification,
  passwordChangedNotification,
  userSettingsUpdatedNotification,
  pleaseChangeYourPasswordNotification,

  createNotification,
  getNotifications,
  updateNotification,
  deleteNotification
}
