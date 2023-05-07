import { payCardDebitsService } from '@services/paymentService'
import { type APIGatewayProxyResult } from 'aws-lambda'

import { type PayCardEvent } from '../types/payCardEventType'

export const payCardDebits = async (event: PayCardEvent): Promise<APIGatewayProxyResult> => {
  const payCardResult = await payCardDebitsService(event)

  return {
    body: JSON.stringify(payCardResult),
    statusCode: 200
  }
}
