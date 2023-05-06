import WalletRepository from '@repositories/walletRepository'
import { type APIGatewayProxyResult } from 'aws-lambda'

import { type ConfigureLimits } from '../types/walletEventType'

export const setWalletLimitService = async (event: ConfigureLimits): Promise<APIGatewayProxyResult> => {
  // wallet is validated and filled up in setWalletLimitMiddleware
  event.wallet.clientLimit = event.body.limitAmount

  return {
    body: JSON.stringify(await new WalletRepository().save(event.wallet)),
    statusCode: 200
  }
}
