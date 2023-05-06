import Exception from '@exceptions/exception'
import InternalException from '@exceptions/internalException'
import type middy from '@middy/core'
import { type MiddlewareObj } from '@middy/core'
import { type APIGatewayProxyResult, type APIGatewayProxyEvent } from 'aws-lambda'

const normalizeError = (err: Error): Exception => {
  if (err instanceof Exception) {
    return err
  }
  return new InternalException(err.message)
}

export default (): MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const onError: middy.MiddlewareFn<any, APIGatewayProxyResult> = async (request: any): Promise<void> => {
    console.error(request.error)

    const exception = normalizeError(request.error)

    request.response = {
      body: JSON.stringify(exception.getBody()),
      headers: { 'Content-Type': 'application/json' },
      statusCode: exception.getStatusCode()
    }
  }
  return {
    onError
  }
}
