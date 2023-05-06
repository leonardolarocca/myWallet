import CardRepository from '@repositories/cardRepository'
import WalletRepository from '@repositories/walletRepository'
import { getAvaliableLimit } from '@utils/cardUtils'
import { type APIGatewayProxyResult } from 'aws-lambda'

import { type PayCardEvent } from '../types/payCardEventType'

export const payCardDebitsService = async (event: PayCardEvent): Promise<APIGatewayProxyResult> => {
  const { card, sum } = event
  const { amount } = event.body

  card.purchases = (sum - amount) ? [sum - amount] : []
  card.avaliableLimit = getAvaliableLimit(card)

  return new CardRepository().save(card).then(async () => {
    const [wallet] = await new WalletRepository().getWalletByIdAndUserId(
      event.pathParameters.walletId,
      event.pathParameters.userId
    )

    wallet.avaliableAmount += amount
    wallet.usedAmount -= amount
    await new WalletRepository().save(wallet)

    return {
      body: JSON.stringify({ wallet: { ...wallet }, card }),
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  })
}
