import InternalException from '@exceptions/internalException'
import NotFoundException from '@exceptions/notFoundException'
import PaymentRequiredException from '@exceptions/paymentRequiredException'
import type middy from '@middy/core'
import { type MiddlewareObj } from '@middy/core'
import CardRepository from '@repositories/cardRepository'
import WalletRepository from '@repositories/walletRepository'
import { type APIGatewayProxyResult, type APIGatewayProxyEvent } from 'aws-lambda'

export default (): MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const before: middy.MiddlewareFn<any, APIGatewayProxyResult> = async (request): Promise<void> => {
    try {
      const { event } = request

      const [wallet] = await new WalletRepository().getWalletByIdAndUserId(
        event.pathParameters.walletId,
        event.pathParameters.userId
      )

      if (!wallet.cards?.length) {
        throw new NotFoundException('Card not found at wallet')
      }

      wallet.cards?.splice(wallet.cards?.indexOf(event.pathParameters.cardNumber), 1)

      const card = await new CardRepository().getOne(event.pathParameters.cardNumber)

      if (!card) {
        throw new NotFoundException('Card not found at wallet')
      }

      if (card.purchases?.length) {
        throw new PaymentRequiredException(`Pay your bills before remove card: ${card.number}`)
      }

      event.wallet = wallet
      event.card = card
    } catch (err: any) {
      throw new InternalException(err)
    }
  }
  return {
    before
  }
}
