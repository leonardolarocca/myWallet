import ConflictException from '@exceptions/conflictException'
import NotFoundException from '@exceptions/notFoundException'
import CardRepository from '@repositories/cardRepository'
import WalletRepository from '@repositories/walletRepository'
import { type Card } from '@schemas/cardSchema'
import { type APIGatewayProxyResult } from 'aws-lambda'

import { type RemoveCard, type AddCard, type GetCard } from '../types/cardEventTypes'

export const getCards = async (event: GetCard): Promise<Card[]> => {
  const [wallet] = await new WalletRepository().getWalletByIdAndUserId(
    event.pathParameters.walletId,
    event.pathParameters.userId
  )

  if (!wallet.cards?.length) {
    throw new NotFoundException(`Cards not found for this wallet: ${wallet.id}`)
  }

  return Promise.all(
    wallet.cards?.map(async card => new CardRepository().getOne(card))
  )
}

export const getCard = async (event: GetCard): Promise<Card> => {
  const [wallet] = await new WalletRepository().getWalletByIdAndUserId(
    event.pathParameters.walletId,
    event.pathParameters.userId
  )

  if (!wallet.cards?.length) {
    throw new NotFoundException(`Cards not found for this wallet: ${wallet.id}`)
  }
  const { cardNumber } = event.pathParameters

  if (!wallet.cards.includes(cardNumber)) {
    throw new NotFoundException(`Card ${cardNumber} not found at wallet`)
  }

  const card = await new CardRepository().getOne(cardNumber)

  card.totalAmount = card.purchases?.reduce((sum, currentValue) => sum + currentValue, 0)
  delete card.purchases

  return card
}

export const addCard = async (event: AddCard): Promise<Card> => {
  const [wallet] = await new WalletRepository().getWalletByIdAndUserId(
    event.pathParameters.walletId,
    event.pathParameters.userId
  )

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

  if (wallet.cards?.includes(card.number)) {
    throw new ConflictException('Card already exists on wallet')
  }

  wallet.cards?.push(card.number)
  wallet.cards = [...new Set(wallet.cards)]
  wallet.maxLimit += card.limit
  wallet.avaliableAmount += card.limit

  return new CardRepository().save(card).then(async (data) => {
    await new WalletRepository().save(wallet)
    return data
  })
}

export const removeCard = async (event: RemoveCard): Promise<APIGatewayProxyResult> => {
  event.wallet.maxLimit -= event.card.limit
  event.wallet.avaliableAmount -= event.card.limit

  return new CardRepository().delete(event.pathParameters.cardNumber).then(async () => {
    await new WalletRepository().save(event.wallet)
    return { statusCode: 204, body: '' }
  })
}
