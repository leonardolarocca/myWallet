import NotFoundException from '@exceptions/notFoundException'
import UserRepository from '@repositories/userRepository'
import WalletRepository from '@repositories/walletRepository'
import { getTotalPurchases } from '@utils/cardUtils'
import { type APIGatewayProxyResult } from 'aws-lambda'
import { v4 } from 'uuid'

import { type CreateWallet, type GetWallet } from '../types/walletEventType'

export const getAllWalletsFromUser = async (event: GetWallet): Promise<APIGatewayProxyResult> => {
  const wallets = await new WalletRepository().getAllWalletsFromUserId(
    event.pathParameters.userId
  )

  if (!wallets.length) {
    throw new NotFoundException('Wallet(s) not found for this user')
  }

  if (wallets[0].cards?.length) {
    wallets[0].used = await getTotalPurchases(wallets[0].cards) ?? 0
  }

  return {
    body: JSON.stringify(wallets),
    statusCode: 200
  }
}

export const getWalletByIdAndUserId = async (event: GetWallet): Promise<APIGatewayProxyResult> => {
  const wallets = await new WalletRepository().getWalletByIdAndUserId(
    event.pathParameters.walletId,
    event.pathParameters.userId
  )

  if (!wallets.length) {
    throw new NotFoundException('Wallet not found')
  }

  if (wallets[0].cards?.length) {
    wallets[0].used = await getTotalPurchases(wallets[0].cards) ?? 0
  }

  return {
    body: JSON.stringify(wallets[0]),
    statusCode: 200
  }
}

export const createWallet = async (event: CreateWallet): Promise<APIGatewayProxyResult> => {
  const user = await new UserRepository().getOne(event.pathParameters.userId)

  if (!user) {
    throw new NotFoundException('Cannot create a wallet for nonexistent user')
  }

  const createdWallet = await new WalletRepository().save({
    id: v4(),
    userId: event.pathParameters.userId,
    maxLimit: 0,
    cards: []
  })

  return {
    body: JSON.stringify(createdWallet),
    statusCode: 200
  }
}
