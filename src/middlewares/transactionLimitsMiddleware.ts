import ForbiddenException from '@exceptions/forbiddenException'
import InternalException from '@exceptions/internalException'
import NotFoundException from '@exceptions/notFoundException'
import type middy from '@middy/core'
import { type MiddlewareObj } from '@middy/core'
import WalletRepository from '@repositories/walletRepository'
import { getTotalPurchases } from '@utils/cardUtils'
import { type APIGatewayProxyResult, type APIGatewayProxyEvent } from 'aws-lambda'

export default (): MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const before: middy.MiddlewareFn<any, APIGatewayProxyResult> = async (request): Promise<void> => {
    try {
      const { event } = request

      const amount: number = event.body.amount

      const [wallet] = await new WalletRepository().getWalletByIdAndUserId(
        event.pathParameters.walletId,
        event.pathParameters.userId
      )

      if (!wallet.cards?.length) {
        throw new NotFoundException('Cards not found')
      }

      const totalPurchases = await getTotalPurchases(wallet.cards) ?? 0
      const limit = (wallet.clientLimit ?? wallet.maxLimit)
      const avaliableLimit = limit - totalPurchases

      if (amount > avaliableLimit) {
        throw new ForbiddenException('You dont have enought limit avaliable to perform this request')
      }

      request.event.wallet = wallet
      request.event.totalPurchases = totalPurchases
    } catch (err: any) {
      throw new InternalException(err)
    }
  }
  return {
    before
  }
}
