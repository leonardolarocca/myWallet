import NotFoundException from '@exceptions/notFoundException'
import type middy from '@middy/core'
import { type MiddlewareObj } from '@middy/core'
import CardRepository from '@repositories/cardRepository'
import WalletRepository from '@repositories/walletRepository'
import { type APIGatewayProxyResult, type APIGatewayProxyEvent } from 'aws-lambda'

export default (): MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const before: middy.MiddlewareFn<any, APIGatewayProxyResult> = async (request): Promise<void> => {
    const { event } = request

    const wallets = await new WalletRepository().getWalletByIdAndUserId(
      event.pathParameters.walletId,
      event.pathParameters.userId
    )

    if (!wallets.length) {
      throw new NotFoundException('Wallet not found')
    }

    if (!wallets[0].cards?.length) {
      throw new NotFoundException('No cards to remove')
    }

    wallets[0].cards?.splice(wallets[0].cards?.indexOf(event.pathParameters.cardNumber), 1)

    const card = await new CardRepository().getOne(event.pathParameters.cardNumber)

    if (!card) {
      throw new NotFoundException('Card not found at wallet')
    }

    // if (card.purchases?.length) {
    //   throw new PaymentRequiredException('Pay your bills before remove card')
    // }

    event.wallet = wallets[0]
    event.card = card
  }
  return {
    before
  }
}
