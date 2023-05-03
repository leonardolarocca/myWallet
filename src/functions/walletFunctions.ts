import NotFoundException from '@exceptions/notFoundException'
import type IApiGatewayProxyEvent from '@interfaces/IApiGatewayProxyEvent'
import WalletModel from '@models/walletModel'
import { type Wallet } from '@schemas/walletSchema'
import { v4 } from 'uuid'

export const getAllWalletsFromUser = async (event: IApiGatewayProxyEvent): Promise<Wallet[]> => {
  return WalletModel.getByUserId(event.pathParameters.userId)
}

export const getWalletInfo = async (event: IApiGatewayProxyEvent): Promise<Wallet[]> => {
  return WalletModel.getById(
    event.pathParameters.walletId,
    event.pathParameters.userId
  )
}

export const createWallet = async (event: IApiGatewayProxyEvent): Promise<Wallet> => {
  const wallet = new WalletModel({
    id: v4(),
    userId: event.pathParameters.userId,
    avaliable: 0,
    clientLimit: 0,
    maxValue: 0,
    cards: []
  })
  return wallet.createWallet()
}

export const configureWalletLimits = async (event: IApiGatewayProxyEvent): Promise<any> => {
  const wallet = (await WalletModel.getById(
    event.pathParameters.walletId,
    event.pathParameters.userId
  ))[0]

  if (!wallet) {
    throw new NotFoundException('Wallet not found')
  }

  if (!wallet.cards?.length) {
    throw new NotFoundException('You need at least one card on wallet to set limit')
  }
}
