import NotFoundException from '@exceptions/notFoundException'
import UnprocessableException from '@exceptions/unprocessableEntityException'
import CardRepository from '@repositories/cardRepository'
import WalletRepository from '@repositories/walletRepository'
import apiGwEvent from '@seeds/apiGwEvent.json'
import cards from '@seeds/cards.json'
import wallets from '@seeds/wallets.json'
import { payCardDebitsHandler } from 'src'
import { describe, test, vi, expect, beforeAll } from 'vitest'

beforeAll(() => {

})

describe('paymentHandler', () => {
  test('It should be throw NotFoundException to not found card', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      },
      body: {
        amount: 100
      }
    }

    vi.spyOn(CardRepository.prototype, 'getOne')
      .mockImplementation(async () => Promise.resolve(undefined))

    const result = await payCardDebitsHandler(event, {})
    expect(result.statusCode).toBe(404)
    expect(result.body).toBe(
      JSON.stringify(new NotFoundException('Card not found').getBody())
    )
  })

  test('It should be throw NotFoundException to a card without bills to pay', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      },
      body: {
        amount: 100
      }
    }

    vi.spyOn(CardRepository.prototype, 'getOne')
      .mockImplementation(async () => Promise.resolve({ ...cards[0], purchases: [] }))

    const result = await payCardDebitsHandler(event, {})
    expect(result.statusCode).toBe(404)
    expect(result.body).toBe(
      JSON.stringify(new NotFoundException('Cards doesnt have bills to pay').getBody())
    )
  })

  test('It should be throw UnprocessableException for amount exceds the card bills', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      },
      body: {
        amount: 10000
      }
    }

    vi.spyOn(CardRepository.prototype, 'getOne')
      .mockImplementation(async () => Promise.resolve(cards[0]))

    const result = await payCardDebitsHandler(event, {})

    const sum = cards[0].purchases.reduce((sum, purchaseValue) => sum + purchaseValue, 0)

    expect(result.statusCode).toBe(422)
    expect(result.body).toBe(
      JSON.stringify(new UnprocessableException(`Amount exceds the sum of card bills, amount belongs to be between 0 and ${sum}`).getBody())
    )
  })

  test('It should be pay card bills correctly', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      },
      body: {
        amount: 100
      }
    }

    vi.spyOn(CardRepository.prototype, 'getOne')
      .mockImplementation(async () => Promise.resolve(cards[0]))

    vi.spyOn(CardRepository.prototype, 'save')
      .mockImplementation(async () => Promise.resolve(cards[0]))

    vi.spyOn(WalletRepository.prototype, 'getWalletByIdAndUserId')
      .mockImplementation(async () => Promise.resolve(wallets))

    vi.spyOn(WalletRepository.prototype, 'save')
      .mockImplementation(async () => Promise.resolve(wallets[0]))

    const result = await payCardDebitsHandler(event, {})

    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(
      JSON.stringify({
        wallet: { ...wallets[0] }, card: cards[0]
      })
    )
  })
})
