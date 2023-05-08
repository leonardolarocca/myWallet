import WalletRepository from '@repositories/walletRepository'
import { type Wallet } from '@schemas/walletSchema'

import { type ConfigureLimits } from '../types/walletEventType'

export const setWalletLimitService = async (event: ConfigureLimits): Promise<Wallet> => {
  // wallet is validated and filled up in setWalletLimitMiddleware
  event.wallet.clientLimit = event.body.limitAmount
  return new WalletRepository().save(event.wallet)
}
