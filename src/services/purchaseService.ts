import type IPurchase from '@interfaces/IPurchase'
import CardRepository from '@repositories/cardRepository'
import WalletRepository from '@repositories/walletRepository'
import { getAvaliableLimit, getSortedCards } from '@utils/cardUtils'

import { type PurchaseEvent } from '../types/purchaseEventType'

export const purchaseService = async (event: PurchaseEvent): Promise<IPurchase> => {
  const { amount } = event.body

  // this comes from transactionLimitsMiddleware
  const { wallet, totalPurchases } = event

  const cards = await getSortedCards(wallet.cards)

  let purchaseAmount = amount

  for (const card of cards) {
    card.avaliableLimit = getAvaliableLimit(card)

    const cardAmount = Math.min(purchaseAmount, card.avaliableLimit)

    if (cardAmount) {
      card.purchases?.push(cardAmount)
    }

    if (card.avaliableLimit < purchaseAmount) {
      card.avaliableLimit = 0
    } else {
      card.avaliableLimit -= purchaseAmount
    }

    purchaseAmount -= cardAmount

    if (purchaseAmount <= 0) {
      break
    }
  }

  await Promise.all(cards.map(async card => new CardRepository().save(card)))

  const usedAmount = Number((totalPurchases + amount).toFixed(2))
  wallet.avaliableAmount = Number((wallet.maxLimit - usedAmount).toFixed(2))
  wallet.usedAmount = usedAmount

  await new WalletRepository().save(wallet)

  return {
    maxLimit: wallet.maxLimit,
    clientLimit: wallet.clientLimit,
    usedAmount,
    avaliableAmount: wallet.avaliableAmount
  }
}
