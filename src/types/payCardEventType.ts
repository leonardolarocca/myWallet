
import { type Card } from '@schemas/cardSchema'
import { type PayCard } from '@schemas/payCardSchema'

import { type IPathParameters } from './cardEventTypes'
import { type Event } from './eventType'
export type PayCardEvent = Omit<Event<PayCard>, 'pathParameters'> & {
  pathParameters: Required<IPathParameters>
  card: Card
  sum: number
}
