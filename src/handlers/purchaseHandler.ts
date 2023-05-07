import { purchaseService } from '@services/purchaseService'
import { type APIGatewayProxyResult } from 'aws-lambda'

import { type PurchaseEvent } from '../types/purchaseEventType'
export const purchase = async (event: PurchaseEvent): Promise<APIGatewayProxyResult> => {
  const purchase = await purchaseService(event)

  return {
    body: JSON.stringify(purchase),
    statusCode: 200
  }
}
