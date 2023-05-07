import ConflictException from '@exceptions/conflictException'
import NotFoundException from '@exceptions/notFoundException'
import CardRepository from '@repositories/cardRepository'
import WalletRepository from '@repositories/walletRepository'
import { type Card } from '@schemas/cardSchema'
import { type APIGatewayProxyResult } from 'aws-lambda'

import { type RemoveCard, type AddCard, type GetCard } from '../types/cardEventTypes'

export const getCards = async (event: GetCard): Promise<APIGatewayProxyResult> => {
  const [wallet] = await new WalletRepository().getWalletByIdAndUserId(
    event.pathParameters.walletId,
    event.pathParameters.userId
  )

  console.log('wallet', wallet)

  // TODO: colocar validacao caso nao encontre a carteira

  if (!wallet.cards?.length) {
    throw Error(`Cards not found for this wallet: ${wallet.id}`)
    // throw new NotFoundException(`Cards not found for this wallet: ${wallet.id}`)
  }

  const cards = await Promise.all(
    wallet.cards?.map(async card => new CardRepository().getOne(card))
  )

  return {
    body: JSON.stringify(cards),
    statusCode: 200
  }
}

export const getCard = async (event: GetCard): Promise<APIGatewayProxyResult> => {
  const [wallet] = await new WalletRepository().getWalletByIdAndUserId(
    event.pathParameters.walletId,
    event.pathParameters.userId
  )

  // TODO: colocar validacao caso nao encontre a carteira

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

  return {
    body: JSON.stringify(card),
    statusCode: 200
  }
}

export const addCard = async (event: AddCard): Promise<APIGatewayProxyResult> => {
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

  // TODO: validar se o cartao ja foi cadastrado em outra carteira

  if (wallet.cards?.includes(card.number)) {
    throw new ConflictException('Card already exists on wallet')
  }

  wallet.cards?.push(card.number)
  wallet.cards = [...new Set(wallet.cards)]
  wallet.maxLimit += card.limit
  wallet.avaliableAmount += card.limit

  const createdCard = await new CardRepository().save(card).then(async (data) => {
    await new WalletRepository().save(wallet)
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
  event.wallet.avaliableAmount -= event.card.limit

  if (!event.wallet.clientLimit) {
    delete event.wallet.clientLimit
  }

  return new CardRepository().delete(event.pathParameters.cardNumber).then(async () => {
    await new WalletRepository().save(event.wallet)
    return { statusCode: 204, body: '' }
  })
}
