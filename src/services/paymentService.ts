import CardRepository from '@repositories/cardRepository'
import WalletRepository from '@repositories/walletRepository'
import { getAvaliableLimit, getTotalPurchases } from '@utils/cardUtils'

import { type PayCardEvent } from '../types/payCardEventType'

export const payCardDebitsService = async (event: PayCardEvent): Promise<any> => {
  const { card, sum } = event
  const { amount } = event.body

  card.purchases = (sum - amount) ? [sum - amount] : []
  card.avaliableLimit = getAvaliableLimit(card)

  return new CardRepository().save(card).then(async (data) => {
    const wallets = await new WalletRepository().getWalletByIdAndUserId(
      event.pathParameters.walletId,
      event.pathParameters.userId
    )

    wallets[0].used = await getTotalPurchases(wallets[0].cards ?? [])

    await new WalletRepository().save(wallets[0])

    return { wallet: { ...wallets[0] }, card }
  })
}
