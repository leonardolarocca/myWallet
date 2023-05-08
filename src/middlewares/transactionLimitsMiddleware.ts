import ForbiddenException from '@exceptions/forbiddenException'
import NotFoundException from '@exceptions/notFoundException'
import type middy from '@middy/core'
import { type MiddlewareObj } from '@middy/core'
import WalletRepository from '@repositories/walletRepository'
import { getTotalPurchases } from '@utils/cardUtils'
import { type APIGatewayProxyResult, type APIGatewayProxyEvent } from 'aws-lambda'

export default (): MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const before: middy.MiddlewareFn<any, APIGatewayProxyResult> = async (request): Promise<void> => {
    const { event } = request

    const amount: number = event.body.amount

    const wallets = await new WalletRepository().getWalletByIdAndUserId(
      event.pathParameters.walletId,
      event.pathParameters.userId
    )

    if (!wallets.length) {
      throw new NotFoundException('Wallet not found')
    }

    if (!wallets[0].cards?.length) {
      throw new NotFoundException('Cards not found')
    }

    const totalPurchases = await getTotalPurchases(wallets[0].cards) ?? 0
    const limit = (wallets[0].clientLimit ?? wallets[0].maxLimit)
    const avaliableLimit = limit - totalPurchases

    if (amount > avaliableLimit) {
      throw new ForbiddenException('You dont have enought limit avaliable to perform this request')
    }

    request.event.wallet = wallets[0]
    request.event.totalPurchases = totalPurchases
  }
  return {
    before
  }
}
