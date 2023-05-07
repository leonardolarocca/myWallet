import WalletRepository from '@repositories/walletRepository'
import { type APIGatewayProxyResult } from 'aws-lambda'
import { v4 } from 'uuid'

import { type CreateWallet, type GetWallet } from '../types/walletEventType'

export const getAllWalletsFromUser = async (event: GetWallet): Promise<APIGatewayProxyResult> => {
  const wallets = await new WalletRepository().getAllWalletsFromUserId(
    event.pathParameters.userId
  )

  return {
    body: JSON.stringify(wallets),
    statusCode: 200
  }
}

export const getWalletByIdAndUserId = async (event: GetWallet): Promise<APIGatewayProxyResult> => {
  const wallet = await new WalletRepository().getWalletByIdAndUserId(
    event.pathParameters.walletId,
    event.pathParameters.userId
  )

  return {
    body: JSON.stringify(wallet),
    statusCode: 200
  }
}

export const createWallet = async (event: CreateWallet): Promise<APIGatewayProxyResult> => {
  const createdWallet = await new WalletRepository().save({
    id: v4(),
    userId: event.pathParameters.userId,
    avaliableAmount: 0,
    usedAmount: 0,
    maxLimit: 0,
    cards: []
  })

  return {
    body: JSON.stringify(createdWallet),
    statusCode: 200
  }
}
