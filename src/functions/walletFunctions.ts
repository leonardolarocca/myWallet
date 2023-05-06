import NotFoundException from '@exceptions/notFoundException'
import UnauthorizedException from '@exceptions/unauthorizedException'
import type IApiGatewayProxyEvent from '@interfaces/IApiGatewayProxyEvent'
import CardModel from '@models/cardModel'
import WalletModel from '@models/walletModel'
import { type Card } from '@schemas/cardSchema'
import { type Wallet } from '@schemas/walletSchema'
import { getAvaliableLimit, getSortedCards, getTotalPurchases } from '@utils/cardUtils'
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
    avaliableAmount: 0,
    usedAmount: 0,
    maxLimit: 0,
    cards: []
  })
  return wallet.save()
}

export const configureWalletLimits = async (event: IApiGatewayProxyEvent): Promise<Wallet> => {
  const [wallet] = (await WalletModel.getById(
    event.pathParameters.walletId,
    event.pathParameters.userId
  ))

  if (!wallet) {
    throw new NotFoundException('Wallet not found')
  }

  if (!wallet.cards?.length) {
    throw new NotFoundException('You need at least one card on wallet to set limit')
  }

  const { limitAmount } = event.body

  if (limitAmount > wallet.maxLimit) {
    throw new UnauthorizedException('limit amount exceds the wallet max value')
  }

  const usedLimit = await getTotalPurchases(wallet.cards) ?? 0

  if (limitAmount < usedLimit) {
    throw new UnauthorizedException(`limit min should be greater or equal to ${usedLimit}`)
  }

  wallet.clientLimit = limitAmount
  await new WalletModel(wallet).save()

  return wallet
}

export const buy = async (event: IApiGatewayProxyEvent): Promise<Record<string, any>> => {
  const amount: number = event.body.amount

  const [wallet] = await WalletModel.getById(
    event.pathParameters.walletId,
    event.pathParameters.userId
  )

  if (!wallet.cards?.length) {
    throw new NotFoundException('cards not found')
  }

  const totalPurchases = await getTotalPurchases(wallet.cards) ?? 0
  const limit = (wallet.clientLimit ?? wallet.maxLimit)
  const avaliableLimit = limit - totalPurchases

  if (amount > avaliableLimit) {
    throw new UnauthorizedException('You dont have enought limit avaliable to perform this request')
  }

  const cards = await getSortedCards(wallet.cards)

  await splitPurchases(amount, cards).then(async cards => {
    return Promise.all(cards.map(async card => new CardModel(card).save()))
  })

  const usedAmount = Number((totalPurchases + amount).toFixed(2))
  wallet.avaliableAmount = Number((wallet.maxLimit - usedAmount).toFixed(2))
  wallet.usedAmount = usedAmount

  await new WalletModel(wallet).save()
  return {
    maxLimit: wallet.maxLimit,
    clientLimit: wallet.clientLimit,
    usedAmount,
    avaliabeAmount: wallet.avaliableAmount
  }
}

const splitPurchases = async (amount: number, cards: Card[]): Promise<Card[]> => {
  const creditCards = cards.map(card => ({ ...card, avaliableLimit: getAvaliableLimit(card) }))

  for (const card of creditCards) {
    const cardAmount = Math.min(amount, card.avaliableLimit)

    if (cardAmount) {
      card.purchases?.push(cardAmount)
    }

    if (card.avaliableLimit < amount) {
      card.avaliableLimit = 0
    } else {
      card.avaliableLimit -= amount
    }

    amount -= cardAmount

    if (amount <= 0) {
      break
    }
  }

  return creditCards
}
