import config from '@config'
import { Joi } from '@services/joi'
import { pick } from 'lodash'
import mailer from '@services/mailer'

import { checkPermissionsAndProtectedFields } from '@modules/permission/manager'

const notificationText = {
  welcome: () => `Welcome to ${config.productName}!`,
  inviteAccepted: (invitee) => `${invitee} has accepted your invite to ${config.productName}!`,
  passwordChanged: () => `Your password has been updated.`,
  userSettingsUpdated: () => `Your settings have been updated.`
}

const createNotification = async (root, args, context, info) => {
  const { prisma } = context
  const { recipient, message, mailerArgs } = args

  await prisma.mutation.createNotification({
    data: {
      createdBy: { connect: { id: recipient.id } },
      message
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

const publicProps = {
  notificationText,

  createNotification,
  getNotifications,
  updateNotification,
  deleteNotification
}

module.exports = publicProps
export default publicProps
