import ConflictException from '@exceptions/conflictException'
import NotFoundException from '@exceptions/notFoundException'
import type IApiGatewayProxyEvent from '@interfaces/IApiGatewayProxyEvent'
import CardModel from '@models/cardModel'
import WalletModel from '@models/walletModel'
import { type Card } from '@schemas/cardSchema'

export const addCard = async (event: IApiGatewayProxyEvent): Promise<Card> => {
  const wallet = await WalletModel.getById(event.pathParameters.walletId, event.pathParameters.userId)

  const card = new CardModel(event.body)

  const { number, limit } = card.get()

  if (wallet[0].cards?.includes(number)) {
    throw new ConflictException('card already exists on wallet')
  }

  wallet[0].cards?.push(number)
  wallet[0].cards = [...new Set(wallet[0].cards)]
  wallet[0].maxValue += limit

  return card.save().then(async (data) => {
    await (new WalletModel(wallet[0])).save()
    return data
  })
}

export const removeCard = async (event: IApiGatewayProxyEvent): Promise<Record<string, any>> => {
  const wallet = await WalletModel.getById(event.pathParameters.walletId, event.pathParameters.userId)

  if (!wallet[0].cards?.length) {
    throw new NotFoundException('Card not found at wallet')
  }

  const cards = wallet[0].cards?.splice(wallet[0].cards?.indexOf(event.pathParameters.cardNumber))

  const card = await CardModel.getById(event.pathParameters.cardNumber)

  if (!card) {
    throw new NotFoundException('Card not found at wallet')
  }

  wallet[0].maxValue -= card.limit

  return CardModel.removeById(event.pathParameters.cardNumber).then(async () => {
    await (new WalletModel(wallet[0])).save()
    return { statusCode: 204 }
  })
}

export const pay = async (event: IApiGatewayProxyEvent): Promise<string> => {
  return 'OK'
}
