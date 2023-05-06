import { type Card } from '@schemas/cardSchema'
import { type Wallet } from '@schemas/walletSchema'

import { type Event } from './eventType'

export interface IPathParameters {
  userId: string
  walletId: string
  cardNumber?: string
}

export type GetCard = Omit<Event<null>, 'pathParameters'> & {
  pathParameters: Required<IPathParameters>
}

export type AddCard = Omit<Event<Card>, 'pathParameters'> & {
  pathParameters: IPathParameters
}

export type RemoveCard = Omit<Event<null>, 'pathParameters'> & {
  pathParameters: Required<IPathParameters>
  wallet: Wallet
  card: Card
}
