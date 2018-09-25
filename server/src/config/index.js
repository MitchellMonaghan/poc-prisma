import dotenv from 'dotenv'
dotenv.config()

export default {
  env: process.env.NODE_ENV || 'development',

  port: process.env.PORT || 4000,
  appUrl: process.env.APP_URL || 'http://localhost:8080',

  mongoURI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017',

  authSecret: process.env.AUTH_SECRET,
  tokenExipresIn: process.env.TOKEN_EXPIRES_IN || '3d',

  apolloEngineAPIKey: process.env.APOLLO_ENGINE_API_KEY,

  redisDomainName: process.env.REDIS_DOMAIN_NAME,
  redisPortNumber: process.env.REDIS_PORT_NUMBER,
  redisPassword: process.env.REDIS_PASSWORD,

  mailgunAPIKey: process.env.MAILGUN_API_KEY,
  mailgunDomain: process.env.MAILGUN_DOMAIN,
  mailgunSender: process.env.MAILGUN_SENDER,

  companyName: process.env.COMPANY_NAME,
  productName: process.env.PRODUCT_NAME,

  passwordRegex: new RegExp(process.env.PASSWORD_REGEX, 'i') || /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/
}
