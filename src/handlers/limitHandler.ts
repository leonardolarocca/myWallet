import { setWalletLimitService } from '@services/limitService'
import { type APIGatewayProxyResult } from 'aws-lambda'

import { type ConfigureLimits } from '../types/walletEventType'

export const setWalletLimit = async (event: ConfigureLimits): Promise<APIGatewayProxyResult> => {
  return setWalletLimitService(event)
}
