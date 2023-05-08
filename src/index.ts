import { addCard, getCard, getCards, removeCard } from '@handlers/cardHandler'
import { setWalletLimit } from '@handlers/limitHandler'
import { payCardDebits } from '@handlers/paymentHandler'
import { purchase } from '@handlers/purchaseHandler'
import { createUser, getUser } from '@handlers/userHandler'
import { createWallet, getAllWalletsFromUser, getWalletByIdAndUserId } from '@handlers/walletHandler'
import errorHandlerMiddleware from '@middlewares/errorHandlerMiddleware'
import payCardDebitMiddleware from '@middlewares/payCardDebitMiddleware'
import removeCardMiddleware from '@middlewares/removeCardMiddleware'
import schemaValidatorMiddleware from '@middlewares/schemaValidatorMiddleware'
import setWalletLimitMiddleware from '@middlewares/setWalletLimitMiddleware'
import transactionLimitsMiddleware from '@middlewares/transactionLimitsMiddleware'
import handler from '@middy/core'
import httpEventNormalizer from '@middy/http-event-normalizer'
import httpJsonBodyParser from '@middy/http-json-body-parser'
import { cardSchema } from '@schemas/cardSchema'
import { limitsSchema } from '@schemas/limitSchema'
import { payCardSchema } from '@schemas/payCardSchema'
import { purchaseSchema } from '@schemas/purchaseSchema'
import { userSchema } from '@schemas/userSchema'

export const createUserHandler = handler(createUser)
  .use(httpEventNormalizer())
  .use(httpJsonBodyParser())
  .use(schemaValidatorMiddleware(userSchema))
  .use(errorHandlerMiddleware())

export const getUserHandler = handler(getUser)
  .use(httpEventNormalizer())
  .use(httpJsonBodyParser())
  .use(errorHandlerMiddleware())

export const createWalletHandler = handler(createWallet)
  .use(httpEventNormalizer())
  .use(httpJsonBodyParser())
  .use(errorHandlerMiddleware())

export const getAllWalletsFromUserHandler = handler(getAllWalletsFromUser)
  .use(httpEventNormalizer())
  .use(httpJsonBodyParser())
  .use(errorHandlerMiddleware())

export const getWalletByIdAndUserIdHandler = handler(getWalletByIdAndUserId)
  .use(httpEventNormalizer())
  .use(httpJsonBodyParser())
  .use(errorHandlerMiddleware())

export const setWalletLimitHandler = handler(setWalletLimit)
  .use(httpEventNormalizer())
  .use(httpJsonBodyParser())
  .use(schemaValidatorMiddleware(limitsSchema))
  .use(setWalletLimitMiddleware())
  .use(errorHandlerMiddleware())

export const purchaseHandler = handler(purchase)
  .use(httpEventNormalizer())
  .use(httpJsonBodyParser())
  .use(schemaValidatorMiddleware(purchaseSchema))
  .use(transactionLimitsMiddleware())
  .use(errorHandlerMiddleware())

export const getCardsHandler = handler(getCards)
  .use(httpEventNormalizer())
  .use(httpJsonBodyParser())
  .use(errorHandlerMiddleware())

export const getCardHandler = handler(getCard)
  .use(httpEventNormalizer())
  .use(httpJsonBodyParser())
  .use(errorHandlerMiddleware())

export const addCardHandler = handler(addCard)
  .use(httpEventNormalizer())
  .use(httpJsonBodyParser())
  .use(schemaValidatorMiddleware(cardSchema))
  .use(errorHandlerMiddleware())

export const removeCardHandler = handler(removeCard)
  .use(httpEventNormalizer())
  .use(httpJsonBodyParser())
  .use(removeCardMiddleware())
  .use(errorHandlerMiddleware())

export const payCardDebitsHandler = handler(payCardDebits)
  .use(httpEventNormalizer())
  .use(httpJsonBodyParser())
  .use(schemaValidatorMiddleware(payCardSchema))
  .use(payCardDebitMiddleware())
  .use(errorHandlerMiddleware())
