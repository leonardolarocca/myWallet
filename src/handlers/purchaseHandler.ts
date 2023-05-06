import type IPurchase from '@interfaces/IPurchase'
import { purchaseService } from '@services/purchaseService'

import { type PurchaseEvent } from '../types/purchaseEventType'
export const purchase = async (event: PurchaseEvent): Promise<IPurchase> => {
  return purchaseService(event)
}
