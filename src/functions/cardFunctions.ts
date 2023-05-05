import ConflictException from '@exceptions/conflictException'
import NotFoundException from '@exceptions/notFoundException'
import UnauthorizedException from '@exceptions/unauthorizedException'
import UnprocessableException from '@exceptions/unprocessableEntityException'
import type IApiGatewayProxyEvent from '@interfaces/IApiGatewayProxyEvent'
import CardModel from '@models/cardModel'
import WalletModel from '@models/walletModel'
import { type Card } from '@schemas/cardSchema'
import { getAvaliableLimit } from '@utils/cardUtils'

export const getCardsFromWallet = async (event: IApiGatewayProxyEvent): Promise<Card[]> => {
  const [wallet] = await WalletModel.getById(
    event.pathParameters.walletId,
    event.pathParameters.userId
  )

  if (!wallet.cards?.length) {
    throw new NotFoundException(`Cards not found for this wallet: ${wallet.id}`)
  }

  return Promise.all(
    wallet.cards?.map(async card => CardModel.getById(card))
  )
}

export const getCardFromWallet = async (event: IApiGatewayProxyEvent): Promise<Card> => {
  const [wallet] = await WalletModel.getById(
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

  const cardModel = await CardModel.getById(cardNumber)

  cardModel.totalAmount = cardModel.purchases?.reduce((sum, currentValue) => sum + currentValue, 0)
  delete cardModel.purchases

  return cardModel
}

export const addCard = async (event: IApiGatewayProxyEvent): Promise<Card> => {
  const [wallet] = await WalletModel.getById(
    event.pathParameters.walletId,
    event.pathParameters.userId
  )

  const card = new CardModel({ ...event.body, purchases: [] })

  const { number, limit } = card.get()

  if (wallet.cards?.includes(number)) {
    throw new ConflictException('card already exists on wallet')
  }

  wallet.cards?.push(number)
  wallet.cards = [...new Set(wallet.cards)]
  wallet.maxLimit += limit
  wallet.avaliableAmount += limit

  return card.save().then(async (data) => {
    await (new WalletModel(wallet)).save()
    return data
  })
}

export const removeCard = async (event: IApiGatewayProxyEvent): Promise<Record<string, any>> => {
  const [wallet] = await WalletModel.getById(
    event.pathParameters.walletId,
    event.pathParameters.userId
  )

  if (!wallet.cards?.length) {
    throw new NotFoundException('Card not found at wallet')
  }

  wallet.cards?.splice(wallet.cards?.indexOf(event.pathParameters.cardNumber), 1)

  const card = await CardModel.getById(event.pathParameters.cardNumber)

  if (!card) {
    throw new NotFoundException('Card not found at wallet')
  }

  if (card.purchases?.length) {
    throw new UnauthorizedException(`pay your bills before remove card: ${card.number}`)
  }

  wallet.maxLimit -= card.limit
  wallet.avaliableAmount -= card.limit

  return CardModel.removeById(event.pathParameters.cardNumber).then(async () => {
    await (new WalletModel(wallet)).save()
    return { statusCode: 204 }
  })
}

export const pay = async (event: IApiGatewayProxyEvent): Promise<any> => {
  const amount: number = event.body.amount

  const card = await CardModel.getById(event.pathParameters.cardNumber)

  if (!card) {
    throw new NotFoundException('card not found')
  }

  if (!card.purchases?.length) {
    throw new NotFoundException('cards doesnt have bills to pay')
  }

  const sum = card.purchases.reduce((sum, purchaseValue) => sum + purchaseValue, 0)

  if (amount > sum) {
    throw new UnprocessableException(`amount exceds the sum of card bills, amount belongs to be between 0 and ${sum}`)
  }

  card.purchases = (sum - amount) ? [sum - amount] : []
  card.avaliableLimit = getAvaliableLimit(card)

  const newCard = new CardModel(card)
  return newCard.save().then(async () => {
    const [wallet] = await WalletModel.getById(
      event.pathParameters.walletId,
      event.pathParameters.userId
    )

    wallet.avaliableAmount += amount
    wallet.usedAmount -= amount
    await new WalletModel(wallet).save()

    return { wallet: { ...wallet }, card }
  })
}
