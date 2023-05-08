import NotFoundException from '@exceptions/notFoundException'
import BaseRepository from '@repositories/baseRepository'
import CardRepository from '@repositories/cardRepository'
import WalletRepository from '@repositories/walletRepository'
import apiGwEvent from '@seeds/apiGwEvent.json'
import cards from '@seeds/cards.json'
import users from '@seeds/users.json'
import wallets from '@seeds/wallets.json'
import { getAllWalletsFromUserHandler, getWalletByIdAndUserIdHandler, createWalletHandler } from 'src'
import { describe, test, vi, expect } from 'vitest'

let getAllWalletsFromUserSpy
let getWalletByIdAndUserSpy
let getUserSpy

describe('getWalletsByUserId', () => {
  test('It should get all wallets from user correctly', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId
      }
    }

    getAllWalletsFromUserSpy = vi.spyOn(WalletRepository.prototype, 'getAllWalletsFromUserId')
      .mockImplementationOnce(async () => Promise.resolve(wallets))

    vi.spyOn(CardRepository.prototype, 'getOne')
      .mockImplementationOnce(async () => Promise.resolve(cards[0]))
      .mockImplementationOnce(async () => Promise.resolve(cards[1]))
      .mockImplementationOnce(async () => Promise.resolve(cards[2]))

    const response = await getAllWalletsFromUserHandler(event, {})
    expect(response.statusCode).toBe(200)
    expect(response.body).toBe(JSON.stringify(wallets))
  })

  test('It should throw 404 NotFoundException to user without wallets', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId
      }
    }

    getAllWalletsFromUserSpy.mockImplementationOnce(async () => Promise.resolve([]))

    const response = await getAllWalletsFromUserHandler(event, {})
    expect(response.statusCode).toBe(404)
    expect(response.body).toBe(
      JSON.stringify(new NotFoundException('Wallet(s) not found for this user').getBody())
    )
  })
})

describe('getWalletByIdAndUserId', () => {
  test('It should be get one wallet from user by wallet id correctly', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      }
    }

    getWalletByIdAndUserSpy = vi.spyOn(WalletRepository.prototype, 'getWalletByIdAndUserId')
      .mockImplementationOnce(async () => Promise.resolve(wallets))

    vi.spyOn(CardRepository.prototype, 'getOne')
      .mockImplementationOnce(async () => Promise.resolve(cards[0]))
      .mockImplementationOnce(async () => Promise.resolve(cards[1]))
      .mockImplementationOnce(async () => Promise.resolve(cards[2]))

    const response = await getWalletByIdAndUserIdHandler(event, {})
    expect(response.statusCode).toBe(200)
    expect(response.body).toBe(JSON.stringify(wallets[0]))
  })

  test('It should be throw 404 NotFoundException to get one wallet with wrong id', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      }
    }

    getWalletByIdAndUserSpy.mockImplementationOnce(async () => Promise.resolve([]))

    const response = await getWalletByIdAndUserIdHandler(event, {})
    expect(response.statusCode).toBe(404)
    expect(response.body).toBe(
      JSON.stringify(new NotFoundException('Wallet not found').getBody())
    )
  })
})

describe('createWallet', () => {
  test('It should be create wallet correctly', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: users[0].id
      }
    }

    vi.spyOn(BaseRepository.prototype, 'save').mockImplementation(async () => Promise.resolve(wallets[0]))
    getUserSpy = vi.spyOn(BaseRepository.prototype, 'getOne')
      .mockImplementation(async () => Promise.resolve(users[0]))

    const response = await createWalletHandler(event, {})
    expect(response.statusCode).toBe(200)
    expect(response.body).toBe(
      JSON.stringify(wallets[0])
    )
  })

  test('It should be throw error for create wallet nonexistent user', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: 'ton'
      }
    }

    getUserSpy.mockImplementation(async () => Promise.resolve(undefined))

    const result = await createWalletHandler(event, {})
    expect(result.statusCode).toBe(404)
    expect(result.body).toBe(
      JSON.stringify(new NotFoundException('Cannot create a wallet for nonexistent user').getBody())
    )
  })
})
