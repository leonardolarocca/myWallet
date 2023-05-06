import { type Purchase } from '@schemas/purchaseSchema'
import { type Wallet } from '@schemas/walletSchema'

import { type Event } from './eventType'

export type PurchaseEvent = Event<Purchase> & {
  wallet: Required<Wallet>
  totalPurchases: number
}
