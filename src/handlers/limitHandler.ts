import { setWalletLimitService } from '@services/limitService'
import { type APIGatewayProxyResult } from 'aws-lambda'

import { type ConfigureLimits } from '../types/walletEventType'

export const setWalletLimit = async (event: ConfigureLimits): Promise<APIGatewayProxyResult> => {
  const walletLimits = await setWalletLimitService(event)

  return {
    body: JSON.stringify(walletLimits),
    statusCode: 200
  }
}
