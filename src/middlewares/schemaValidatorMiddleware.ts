import UnprocessableException from '@exceptions/unprocessableEntityException'
import type middy from '@middy/core'
import { type MiddlewareObj } from '@middy/core'
import { type APIGatewayProxyResult, type APIGatewayProxyEvent } from 'aws-lambda'
import { z } from 'zod'

export default (schema: z.ZodObject<Record<string, any>>): MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const before: middy.MiddlewareFn<any, APIGatewayProxyResult> = async (request): Promise<void> => {
    try {
      request.event.body = schema.parse(request.event.body)
    } catch (err: any) {
      throw new UnprocessableException(new z.ZodError(err).message)
    }
  }
  return {
    before
  }
}
