import { type Card } from '@schemas/cardSchema'

import BaseRepository from './baseRepository'

class CardRepository extends BaseRepository<Card> {
  public constructor () {
    super('cards', 'number')
  }
}

export default CardRepository
