import dotenv from 'dotenv'
dotenv.config()

export default {
  env: process.env.NODE_ENV || 'development',

  port: process.env.PORT || 4000,
  appUrl: process.env.APP_URL || 'http://localhost:8080',

  prismaUrl: process.env.PRISMA_URL,
  prismaSecret: process.env.PRISMA_SECRET,

  authSecret: process.env.AUTH_SECRET,
  tokenExipresIn: process.env.TOKEN_EXPIRES_IN || '3d',

  apolloEngineAPIKey: process.env.APOLLO_ENGINE_API_KEY,

  mailgunAPIKey: process.env.MAILGUN_API_KEY,
  mailgunDomain: process.env.MAILGUN_DOMAIN,
  mailgunSender: process.env.MAILGUN_SENDER,

  companyName: process.env.COMPANY_NAME,
  productName: process.env.PRODUCT_NAME,

  passwordRegex: new RegExp(process.env.PASSWORD_REGEX, 'i') || /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/
}
