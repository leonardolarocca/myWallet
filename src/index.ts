import UserFunctions from '@functions/userFunctions'
import schemaValidatorMiddleware from '@middlewares/schemaValidatorMiddleware'
import handler from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import httpJsonBodyParser from '@middy/http-json-body-parser'
import { userSchema } from '@schemas/userSchema'

const errorHandler = httpErrorHandler({ fallbackMessage: 'Something wrong is not right.' })

// Constructors area
const userFunctions = new UserFunctions()

export const createUser = handler(userFunctions.createUser)
  .use(httpJsonBodyParser())
  .use(schemaValidatorMiddleware(userSchema))
  .use(errorHandler)

export const getUserInfo = handler(userFunctions.getUserInfo)
  .use(httpJsonBodyParser())
  .use(errorHandler)
