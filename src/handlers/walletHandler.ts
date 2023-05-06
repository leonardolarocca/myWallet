import WalletRepository from '@repositories/walletRepository'
import { type Wallet } from '@schemas/walletSchema'
import { v4 } from 'uuid'

import { type CreateWallet, type GetWallet } from '../types/walletEventType'

export const getAllWalletsFromUser = async (event: GetWallet): Promise<Wallet[]> => {
  return new WalletRepository().getAllWalletsFromUserId(
    event.pathParameters.userId
  )
}

export const getWalletByIdAndUserId = async (event: GetWallet): Promise<Wallet[]> => {
  return new WalletRepository().getWalletByIdAndUserId(
    event.pathParameters.walletId,
    event.pathParameters.userId
  )
}

export const createWallet = async (event: CreateWallet): Promise<Wallet> => {
  return new WalletRepository().save({
    id: v4(),
    userId: event.pathParameters.userId,
    avaliableAmount: 0,
    usedAmount: 0,
    maxLimit: 0,
    cards: []
  })
}
