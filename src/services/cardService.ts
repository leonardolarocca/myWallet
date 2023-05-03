import CardModel from '@models/cardModel'
import { type Card } from '@schemas/cardSchema'

export const payCard = async (card: Card, amount: number): Promise<any> => {
  const result = new CardModel(card)
  await result.save()
}
