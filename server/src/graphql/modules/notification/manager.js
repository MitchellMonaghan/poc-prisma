import { Joi } from '@services/joi'
import { pick } from 'lodash'

import { checkPermissionsAndProtectedFields } from '@modules/permission/manager'

const createNotification = async (root, args, context, info) => {
  // const { prisma } = context
  // const notification = {}
  // return notification
}

const getNotifications = async (root, args, context, info) => {
  const { prisma } = context
  return prisma.query.notifications({}, info)
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
  }, `{
    user {
      id
    }
  }`)

  notificationToBeUpdated.createdBy = notificationToBeUpdated.user.id

  await checkPermissionsAndProtectedFields(notificationToBeUpdated, args, context, info)

  let updatedNotification = await prisma.mutation.updateNotification({
    where,
    data
  })

  return updatedNotification
}

const publicProps = {
  createNotification,
  getNotifications,
  updateNotification
}

module.exports = publicProps
export default publicProps
