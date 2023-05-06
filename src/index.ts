import { createUser, getUserInfo } from '@functions/userFunctions'
import { configureWalletLimits, createWallet, getAllWalletsFromUser, getWalletInfo } from '@functions/walletFunctions'
import schemaValidatorMiddleware from '@middlewares/schemaValidatorMiddleware'
import handler from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import httpJsonBodyParser from '@middy/http-json-body-parser'
import { userSchema } from '@schemas/userSchema'
import { limitsSchema } from '@schemas/walletSchema'

const errorHandler = httpErrorHandler({ fallbackMessage: 'Something wrong is not right.' })

export const createUserHandler = handler(createUser)
  .use(httpJsonBodyParser())
  .use(schemaValidatorMiddleware(userSchema))
  .use(errorHandler)

export const getUserInfoHandler = handler(getUserInfo)
  .use(httpJsonBodyParser())
  .use(errorHandler)

export const createWalletHandler = handler(createWallet)
  .use(httpJsonBodyParser())
  .use(errorHandler)

export const getAllWalletsFromUserHandler = handler(getAllWalletsFromUser)
  .use(httpJsonBodyParser())
  .use(errorHandler)

export const getWalletInfoHandler = handler(getWalletInfo)
  .use(httpJsonBodyParser())
  .use(errorHandler)

export const configureWalletLimitsHandler = handler(configureWalletLimits)
  .use(httpJsonBodyParser())
  .use(schemaValidatorMiddleware(limitsSchema))
  .use(errorHandler)
