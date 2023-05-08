import CardRepository from '@repositories/cardRepository'
import { type Card } from '@schemas/cardSchema'

export const getSortedCards = async (cardIds: string[]): Promise<Card[]> => {
  const cards: Card[] = []

  await Promise.all(
    cardIds.map(async card => cards.push(await new CardRepository().getOne(card)))
  )

  sortCards(cards)

  return cards
}

function sortCards (cards: Card[]): void {
  cards.sort(function (cardA, cardB) {
    if (cardA.dueDate === cardB.dueDate) {
      if (Number(cardA.limit) > Number(cardB.limit)) {
        return 1
      }
      if (Number(cardA.limit) < Number(cardB.limit)) {
        return -1
      }
      return 0
    } else {
      if (Number(cardA.dueDate) < Number(cardB.dueDate)) {
        return 1
      }
      if (Number(cardA.dueDate) > Number(cardB.dueDate)) {
        return -1
      }
      return 0
    }
  })
}

export const getAvaliableLimit = (card: Card): number => {
  return !card.purchases?.length
    ? card.limit
    : card.limit - card.purchases.reduce((sum, purchaseValue) => sum + purchaseValue, 0)
}

export const getTotalPurchases = async (cards: string[]): Promise<number | undefined> => {
  return Promise.all(
    cards.map(async cardNumber => (
      new CardRepository().getOne(cardNumber).then(card => card.purchases?.reduce((sum, currentValue) => sum + currentValue, 0))
    ))
  ).then(card => card.reduce((sum, currentValue) => sum + currentValue, 0))
}
