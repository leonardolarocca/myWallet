
import { type LimitConfig } from '@schemas/limitSchema'
import { type Wallet } from '@schemas/walletSchema'

import { type Event } from './eventType'

interface IPathParameters {
  userId: string
  walletId?: string
}

export type GetWallet = Omit<Event<null>, 'pathParameters'> & {
  pathParameters: Required<IPathParameters>
}

export type CreateWallet = Omit<Event<Wallet>, 'pathParameters'> & {
  pathParameters: IPathParameters
}

export type ConfigureLimits = Omit<Event<LimitConfig>, 'pathParameters'> & {
  pathParameters: Required<IPathParameters>
  wallet: Wallet
}
