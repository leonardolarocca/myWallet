import ForbiddenException from '@exceptions/forbiddenException'
import InternalException from '@exceptions/internalException'
import NotFoundException from '@exceptions/notFoundException'
import UnprocessableException from '@exceptions/unprocessableEntityException'
import type middy from '@middy/core'
import { type MiddlewareObj } from '@middy/core'
import WalletRepository from '@repositories/walletRepository'
import { getTotalPurchases } from '@utils/cardUtils'
import { type APIGatewayProxyResult, type APIGatewayProxyEvent } from 'aws-lambda'

export default (): MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const before: middy.MiddlewareFn<any, APIGatewayProxyResult> = async (request): Promise<void> => {
    try {
      const { event } = request

      const [wallet] = await new WalletRepository().getWalletByIdAndUserId(
        event.pathParameters.walletId,
        event.pathParameters.userId
      )

      if (!wallet) {
        throw new NotFoundException('Wallet not found')
      }

      if (!wallet.cards?.length) {
        throw new UnprocessableException('You need at least one card on wallet to set limit')
      }

      const { limitAmount } = event.body

      if (limitAmount > wallet.maxLimit) {
        throw new ForbiddenException('Limit amount exceds the wallet max value')
      }

      const usedLimit = await getTotalPurchases(wallet.cards) ?? 0

      if (limitAmount < usedLimit) {
        throw new ForbiddenException(`limit min should be greater or equal to ${usedLimit}`)
      }

      request.event.wallet = wallet
    } catch (err: any) {
      throw new InternalException(err)
    }
  }
  return {
    before
  }
}
