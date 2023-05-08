import NotFoundException from '@exceptions/notFoundException'
import CardRepository from '@repositories/cardRepository'
import WalletRepository from '@repositories/walletRepository'
import apiGwEvent from '@seeds/apiGwEvent.json'
import cards from '@seeds/cards.json'
import wallets from '@seeds/wallets.json'
import { purchaseHandler } from 'src'
import { describe, test, expect, vi, beforeAll } from 'vitest'

let spyedGetWallet

beforeAll(() => {
  spyedGetWallet = vi.spyOn(WalletRepository.prototype, 'getWalletByIdAndUserId')
})

describe('purchaseHandler', () => {
  test('It should be throw NotFoundException to not found wallet', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      },
      body: {
        amount: 10
      }
    }

    spyedGetWallet.mockImplementationOnce(async () => Promise.resolve([]))

    const result = await purchaseHandler(event, {})
    expect(result.statusCode).toBe(404)
    expect(result.body).toBe(
      JSON.stringify(new NotFoundException('Wallet not found').getBody())
    )
  })

  test('It should be throw NotFoundException to not found cards on wallet', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      },
      body: {
        amount: 10
      }
    }

    spyedGetWallet.mockImplementationOnce(async () => Promise.resolve([{ ...wallets[0], cards: [] }]))

    const result = await purchaseHandler(event, {})
    expect(result.statusCode).toBe(404)
    expect(result.body).toBe(
      JSON.stringify(new NotFoundException('Cards not found').getBody())
    )
  })

  test('It should be throw ForbiddenException for not have enought limit', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      },
      body: {
        amount: 10
      }
    }

    spyedGetWallet.mockImplementationOnce(async () => Promise.resolve(wallets))

    const spyedCardsGetOne = vi.spyOn(CardRepository.prototype, 'getOne')
      .mockImplementationOnce(async () => Promise.resolve(cards[0]))
      .mockImplementationOnce(async () => Promise.resolve(cards[1]))
      .mockImplementationOnce(async () => Promise.resolve(cards[2]))
      .mockImplementationOnce(async () => Promise.resolve(cards[0]))
      .mockImplementationOnce(async () => Promise.resolve(cards[1]))
      .mockImplementationOnce(async () => Promise.resolve(cards[2]))

    vi.spyOn(CardRepository.prototype, 'save')
      .mockImplementationOnce(async () => Promise.resolve(cards[0]))
      .mockImplementationOnce(async () => Promise.resolve(cards[1]))
      .mockImplementationOnce(async () => Promise.resolve(cards[2]))

    const mockWalletResponse = {
      maxLimit: wallets[0].maxLimit,
      clientLimit: wallets[0].clientLimit,
      usedAmount: 110,
      avaliableAmount: 6890
    }

    vi.spyOn(WalletRepository.prototype, 'save')
      .mockImplementationOnce(async () => Promise.resolve({ ...wallets[0], ...mockWalletResponse }))

    const result = await purchaseHandler(event, {})

    expect(spyedCardsGetOne).toBeCalledTimes(6)
    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(
      JSON.stringify(mockWalletResponse)
    )
  })

  test('It should make a purchase correctly', async () => {

  })
})
