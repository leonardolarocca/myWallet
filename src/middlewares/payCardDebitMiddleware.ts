import NotFoundException from '@exceptions/notFoundException'
import UnauthorizedException from '@exceptions/unauthorizedException'
import UnprocessableException from '@exceptions/unprocessableEntityException'
import type middy from '@middy/core'
import { type MiddlewareObj } from '@middy/core'
import CardRepository from '@repositories/cardRepository'
import { type APIGatewayProxyResult, type APIGatewayProxyEvent } from 'aws-lambda'

export default (): MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const before: middy.MiddlewareFn<any, APIGatewayProxyResult> = async (request): Promise<void> => {
    try {
      const { event } = request
      const amount: number = event.body.amount

      const card = await new CardRepository().getOne(event.pathParameters.cardNumber)

      if (!card) {
        throw new NotFoundException('card not found')
      }

      if (!card.purchases?.length) {
        throw new NotFoundException('cards doesnt have bills to pay')
      }

      const sum = card.purchases.reduce((sum, purchaseValue) => sum + purchaseValue, 0)

      if (amount > sum) {
        throw new UnprocessableException(`amount exceds the sum of card bills, amount belongs to be between 0 and ${sum}`)
      }

      event.card = card
      event.sum = sum
    } catch (err: any) {
      throw new UnauthorizedException(err)
    }
  }
  return {
    before
  }
}