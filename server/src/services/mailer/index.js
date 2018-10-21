import config from '@config'
import path from 'path'
import mailgun from 'mailgun-js'

import { loadFolder } from '@services/moduleLoader'

// Templates
const emailTemplates = loadFolder(path.join(__dirname, './templates'))

const mailgunClient = mailgun({
  apiKey: config.mailgunAPIKey,
  domain: config.mailgunDomain
})

const sendEmail = async (templateName, recipients, data) => {
  let email = await emailTemplates[templateName].default(data)
  email.from = config.mailgunSender
  email.to = recipients.join(',')

  mailgunClient.messages().send(email, function (error, body) {
    if (error) {
      console.log(error)
    }

    console.log(body)
  })
}

const emailEnum = {}
Object.keys(emailTemplates).forEach(key => {
  emailEnum[key] = key
})

export {
  emailEnum,
  sendEmail
}
