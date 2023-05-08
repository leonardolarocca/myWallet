import ConflictException from '@exceptions/conflictException'
import NotFoundException from '@exceptions/notFoundException'
import CardRepository from '@repositories/cardRepository'
import WalletRepository from '@repositories/walletRepository'
import { type Card } from '@schemas/cardSchema'
import { type APIGatewayProxyResult } from 'aws-lambda'

import { type RemoveCard, type AddCard, type GetCard } from '../types/cardEventTypes'

export const getCards = async (event: GetCard): Promise<APIGatewayProxyResult> => {
  const wallets = await new WalletRepository().getWalletByIdAndUserId(
    event.pathParameters.walletId,
    event.pathParameters.userId
  )

  if (!wallets.length) {
    throw new NotFoundException('Wallet not found')
  }

  if (!wallets[0].cards?.length) {
    throw new NotFoundException(`Cards not found for this wallet: ${wallets[0].id}`)
  }

  const cards = await Promise.all(
    wallets[0].cards?.map(async card => new CardRepository().getOne(card))
  )

  return {
    body: JSON.stringify(cards),
    statusCode: 200
  }
}

export const getCard = async (event: GetCard): Promise<APIGatewayProxyResult> => {
  const wallets = await new WalletRepository().getWalletByIdAndUserId(
    event.pathParameters.walletId,
    event.pathParameters.userId
  )

  if (!wallets.length) {
    throw new NotFoundException('Wallet not found')
  }

  if (!wallets[0].cards?.length) {
    throw new NotFoundException(`Card not found for this wallet: ${wallets[0].id}`)
  }

  const { cardNumber } = event.pathParameters

  if (!wallets[0].cards.includes(cardNumber)) {
    throw new NotFoundException(`Card ${cardNumber} not found at wallet`)
  }

  const card = await new CardRepository().getOne(cardNumber)

  card.totalAmount = card.purchases?.reduce((sum, currentValue) => sum + currentValue, 0)
  delete card.purchases

  return {
    body: JSON.stringify(card),
    statusCode: 200
  }
}

export const addCard = async (event: AddCard): Promise<APIGatewayProxyResult> => {
  const wallets = await new WalletRepository().getWalletByIdAndUserId(
    event.pathParameters.walletId,
    event.pathParameters.userId
  )

  if (!wallets.length) {
    throw new NotFoundException('Wallet not found')
  }

  const card: Card = {
    number: event.body.number,
    cardholder: event.body.cardholder,
    dueDate: event.body.dueDate,
    expirationMonth: event.body.expirationMonth,
    expirationYear: event.body.expirationYear,
    cvv: event.body.cvv,
    limit: event.body.limit,
    avaliableLimit: event.body.avaliableLimit,
    purchases: [],
    totalAmount: 0
  }

  if (wallets[0].cards?.includes(card.number)) {
    throw new ConflictException('Card already exists on wallet')
  }

  wallets[0].cards?.push(card.number)
  wallets[0].cards = [...new Set(wallets[0].cards)]
  wallets[0].maxLimit += card.limit

  const createdCard = await new CardRepository().save(card).then(async (data) => {
    await new WalletRepository().save(wallets[0])
    return data
  })

  return {
    body: JSON.stringify(createdCard),
    statusCode: 200
  }
}

export const removeCard = async (event: RemoveCard): Promise<APIGatewayProxyResult> => {
  const newMaxLimitClient = event.wallet.maxLimit - event.card.limit
  event.wallet.clientLimit = Math.min(newMaxLimitClient, event.wallet.clientLimit ?? 0)

  event.wallet.maxLimit -= event.card.limit
  const cardSum = event.card.purchases?.reduce((sum, currentValue) => sum + currentValue, 0)
  event.wallet.used -= cardSum ?? 0

  if (!event.wallet.clientLimit) {
    delete event.wallet.clientLimit
  }

  return new CardRepository().delete(event.pathParameters.cardNumber).then(async () => {
    await new WalletRepository().save(event.wallet)
    return { statusCode: 204, body: '' }
  })
}
