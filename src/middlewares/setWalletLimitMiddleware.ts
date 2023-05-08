import ForbiddenException from '@exceptions/forbiddenException'
import NotFoundException from '@exceptions/notFoundException'
import UnprocessableException from '@exceptions/unprocessableEntityException'
import type middy from '@middy/core'
import { type MiddlewareObj } from '@middy/core'
import WalletRepository from '@repositories/walletRepository'
import { getTotalPurchases } from '@utils/cardUtils'
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
      throw new UnprocessableException('You need at least one card on wallet to set limit')
    }

    const { limitAmount } = event.body

    if (limitAmount > wallets[0].maxLimit) {
      throw new ForbiddenException('Limit amount exceds the wallet max value')
    }

    const usedLimit = await getTotalPurchases(wallets[0].cards) ?? 0

    if (limitAmount < usedLimit) {
      throw new ForbiddenException(`Limit min should be greater or equal to ${usedLimit}`)
    }

    request.event.wallet = wallets[0]
  }
  return {
    before
  }
}
