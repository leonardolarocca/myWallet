import { type Wallet } from '@schemas/walletSchema'
import { setWalletLimitService } from '@services/limitService'

import { type ConfigureLimits } from '../types/walletEventType'

export const setWalletLimit = async (event: ConfigureLimits): Promise<Wallet> => {
  return setWalletLimitService(event)
}
