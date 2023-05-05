import { addCard, getCardFromWallet, getCardsFromWallet, pay, removeCard } from '@functions/cardFunctions'
import { createUser, getUserInfo } from '@functions/userFunctions'
import { buy, configureWalletLimits, createWallet, getAllWalletsFromUser, getWalletInfo } from '@functions/walletFunctions'
import schemaValidatorMiddleware from '@middlewares/schemaValidatorMiddleware'
import handler from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import httpJsonBodyParser from '@middy/http-json-body-parser'
import { cardSchema, paySchema } from '@schemas/cardSchema'
import { userSchema } from '@schemas/userSchema'
import { buySchema, limitsSchema } from '@schemas/walletSchema'

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

export const buyHandler = handler(buy)
  .use(httpJsonBodyParser())
  .use(schemaValidatorMiddleware(buySchema))
  .use(errorHandler)

export const addCardHandler = handler(addCard)
  .use(httpJsonBodyParser())
  .use(schemaValidatorMiddleware(cardSchema))
  .use(errorHandler)

export const getCardsFromWalletHandler = handler(getCardsFromWallet)
  .use(httpJsonBodyParser())
  .use(errorHandler)

export const getCardFromWalletHandler = handler(getCardFromWallet)
  .use(httpJsonBodyParser())
  .use(errorHandler)

export const removeCardHandler = handler(removeCard)
  .use(httpJsonBodyParser())
  .use(errorHandler)

export const payHandler = handler(pay)
  .use(httpJsonBodyParser())
  .use(schemaValidatorMiddleware(paySchema))
  .use(errorHandler)
