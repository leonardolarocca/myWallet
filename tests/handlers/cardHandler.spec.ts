import ConflictException from '@exceptions/conflictException'
import NotFoundException from '@exceptions/notFoundException'
import CardRepository from '@repositories/cardRepository'
import WalletRepository from '@repositories/walletRepository'
import apiGwEvent from '@seeds/apiGwEvent.json'
import cards from '@seeds/cards.json'
import wallets from '@seeds/wallets.json'
import { getCardHandler, getCardsHandler, addCardHandler, removeCardHandler } from 'src'
import { describe, vi, expect, test } from 'vitest'

let getAllWalletsFromUserSpy
let getCardsSpy
let walletRepoSaveSpy

describe('getCards', () => {
  test('It should be return all cards from wallet/user correctly', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      }
    }

    getAllWalletsFromUserSpy = vi.spyOn(WalletRepository.prototype, 'getWalletByIdAndUserId')
      .mockImplementationOnce(async () => Promise.resolve(wallets))
    getCardsSpy = vi.spyOn(CardRepository.prototype, 'getOne')
      .mockImplementationOnce(async () => Promise.resolve(cards[0]))
      .mockImplementationOnce(async () => Promise.resolve(cards[1]))
      .mockImplementationOnce(async () => Promise.resolve(cards[2]))

    const result = await getCardsHandler(event, {})
    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(
      JSON.stringify(cards)
    )
  })

  test('It should be throw not found exception for get cards for a nonexistent wallet', async () => {
    getAllWalletsFromUserSpy.mockImplementationOnce(async () => Promise.resolve([]))

    const result = await getCardsHandler(apiGwEvent, {})
    expect(result.statusCode).toBe(404)
    expect(result.body).toBe(
      JSON.stringify(new NotFoundException('Wallet not found').getBody())
    )
  })

  test('It should be throw not found exception for get cards for a empty wallet', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      }
    }
    getAllWalletsFromUserSpy.mockImplementationOnce(async () => Promise.resolve([{ ...wallets[0], cards: [] }]))

    const result = await getCardsHandler(apiGwEvent, {})
    expect(result.statusCode).toBe(404)
    expect(result.body).toBe(
      JSON.stringify(new NotFoundException(`Cards not found for this wallet: ${wallets[0].id}`).getBody())
    )
  })
})

describe('getCard', () => {
  test('It should be return card correctly', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id,
        cardNumber: wallets[0].cards[0]
      }
    }

    getAllWalletsFromUserSpy.mockImplementationOnce(async () => Promise.resolve(wallets))

    getCardsSpy.mockImplementationOnce(async () => Promise.resolve(cards[0]))

    const result = await getCardHandler(event, {})
    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(
      JSON.stringify(cards[0])
    )
  })
  test('It should be throw not found exception for get card for a nonexistent wallet', async () => {
    getAllWalletsFromUserSpy.mockImplementationOnce(async () => Promise.resolve([]))

    const result = await getCardsHandler(apiGwEvent, {})
    expect(result.statusCode).toBe(404)
    expect(result.body).toBe(
      JSON.stringify(new NotFoundException('Wallet not found').getBody())
    )
  })

  test('It should be throw not found exception for get card for a empty wallet', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id,
        cardNumber: wallets[0].cards[0]
      }
    }
    getAllWalletsFromUserSpy.mockImplementationOnce(async () => Promise.resolve([{ ...wallets[0], cards: [] }]))

    const result = await getCardsHandler(apiGwEvent, {})
    expect(result.statusCode).toBe(404)
    expect(result.body).toBe(
      JSON.stringify(new NotFoundException(`Cards not found for this wallet: ${wallets[0].id}`).getBody())
    )
  })
})

describe('addCard', () => {
  test('It should be throw NotFoundException on try add a card on nonexistent wallet', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      },
      body: cards[0]
    }

    getAllWalletsFromUserSpy.mockImplementationOnce(async () => Promise.resolve([]))

    const result = await addCardHandler(event, {})
    expect(result.body).toBe(
      JSON.stringify(new NotFoundException('Wallet not found').getBody())
    )
  })

  test('It should be create card correctly', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      },
      body: cards[0]
    }

    walletRepoSaveSpy = vi.spyOn(WalletRepository.prototype, 'save').mockImplementation(async () => Promise.resolve({
      ...wallets[0],
      cards: ['0000000000000001']
    }))

    vi.spyOn(CardRepository.prototype, 'save').mockImplementation(async () => Promise.resolve(cards[0]))

    getAllWalletsFromUserSpy.mockImplementationOnce(async () => Promise.resolve([{ ...wallets[0], cards: [] }]))

    const result = await addCardHandler(event, {})
    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(
      JSON.stringify(cards[0])
    )
  })

  test('It should be try create a card with wrong schema', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      },
      body: {
        name: 'ton'
      }
    }

    getAllWalletsFromUserSpy.mockImplementationOnce(async () => Promise.resolve(wallets))

    const result = await addCardHandler(event, {})
    expect(result.statusCode).toBe(422)
  })

  test('It shound be throw ConflictException for existing card on wallet', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      },
      body: cards[0]
    }

    getAllWalletsFromUserSpy.mockImplementationOnce(async () => Promise.resolve(wallets))

    const result = await addCardHandler(event, {})
    expect(result.statusCode).toBe(409)
    expect(result.body).toBe(
      JSON.stringify(new ConflictException('Card already exists on wallet').getBody())
    )
  })
})

describe('removeCard', () => {
  test('It should be throw NotFoundException for wallet not found', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id,
        cardNumber: wallets[0].cards[0]
      }
    }

    getAllWalletsFromUserSpy.mockImplementationOnce(async () => Promise.resolve([]))

    const result = await removeCardHandler(event, {})
    expect(result.statusCode).toBe(404)
    expect(result.body).toBe(
      JSON.stringify(new NotFoundException('Wallet not found').getBody())
    )
  })

  test('It should be return NotFoundException for wallet with empty cards', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id,
        cardNumber: wallets[0].cards[0]
      }
    }

    getAllWalletsFromUserSpy.mockImplementationOnce(async () => Promise.resolve([{ ...wallets[0], cards: [] }]))

    const result = await removeCardHandler(event, {})
    expect(result.statusCode).toBe(404)
    expect(result.body).toBe(
      JSON.stringify(new NotFoundException('No cards to remove').getBody())
    )
  })

  test('It should be return NotFoundException for card not found at wallet', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id,
        cardNumber: wallets[0].cards[0]
      }
    }

    getAllWalletsFromUserSpy.mockImplementationOnce(async () => Promise.resolve(wallets))
    getCardsSpy.mockImplementationOnce(async () => Promise.resolve(undefined))

    const result = await removeCardHandler(event, {})
    expect(result.statusCode).toBe(404)
    expect(result.body).toBe(
      JSON.stringify(new NotFoundException('Card not found at wallet').getBody())
    )
  })

  // test('It should be return PaymentRequiredException to card with bills', async () => {
  //   const event = {
  //     ...apiGwEvent,
  //     pathParameters: {
  //       userId: wallets[0].userId,
  //       walletId: wallets[0].id,
  //       cardNumber: wallets[0].cards[0]
  //     }
  //   }

  //   getAllWalletsFromUserSpy.mockImplementationOnce(async () => Promise.resolve(wallets))
  //   getCardsSpy.mockImplementationOnce(async () => Promise.resolve({ ...cards[0], purchases: [10] }))

  //   const result = await removeCardHandler(event, {})
  //   expect(result.body).toBe(
  //     JSON.stringify(new PaymentRequiredException('Pay your bills before remove card').getBody())
  //   )
  // })

  test('It should be remove card from wallet correctly', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id,
        cardNumber: wallets[0].cards[0]
      }
    }

    getAllWalletsFromUserSpy.mockImplementationOnce(async () => Promise.resolve(wallets))
    getCardsSpy.mockImplementationOnce(async () => Promise.resolve({ ...cards[0], purchases: [] }))

    vi.spyOn(CardRepository.prototype, 'delete').mockImplementation(async () => Promise.resolve(''))

    const result = await removeCardHandler(event, {})
    expect(result.body).toBe('')
    expect(result.statusCode).toBe(204)
  })
})
