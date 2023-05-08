import ForbiddenException from '@exceptions/forbiddenException'
import NotFoundException from '@exceptions/notFoundException'
import UnprocessableException from '@exceptions/unprocessableEntityException'
import CardRepository from '@repositories/cardRepository'
import WalletRepository from '@repositories/walletRepository'
import apiGwEvent from '@seeds/apiGwEvent.json'
import cards from '@seeds/cards.json'
import wallets from '@seeds/wallets.json'
import { setWalletLimitHandler } from 'src'
import { describe, expect, test, vi } from 'vitest'

let spyedGetWallet

describe('setWalletLimit', () => {
  test('It should be throw NotFoundException to not found wallet', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      },
      body: {
        limitAmount: 10
      }
    }

    spyedGetWallet = vi.spyOn(WalletRepository.prototype, 'getWalletByIdAndUserId')
      .mockImplementationOnce(async () => Promise.resolve([]))

    const result = await setWalletLimitHandler(event, {})
    expect(result.statusCode).toBe(404)
    expect(result.body).toBe(
      JSON.stringify(new NotFoundException('Wallet not found').getBody())
    )
  })

  test('It should be throw UnprocessableException to a wallet without cards', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      },
      body: {
        limitAmount: 10
      }
    }

    // moka uma carteira sem cartao
    spyedGetWallet.mockImplementationOnce(async () => Promise.resolve([
      {
        ...wallets[0],
        cards: []
      }
    ]))

    const result = await setWalletLimitHandler(event, {})
    expect(result.statusCode).toBe(422)
    expect(result.body).toBe(
      JSON.stringify(new UnprocessableException('You need at least one card on wallet to set limit').getBody())
    )
  })

  test('It should be throw ForbiddenException to amount exceds the wallet max value', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      },
      body: {
        limitAmount: 10000
      }
    }

    spyedGetWallet.mockImplementationOnce(async () => Promise.resolve(wallets))

    const result = await setWalletLimitHandler(event, {})
    expect(result.statusCode).toBe(403)
    expect(result.body).toBe(
      JSON.stringify(new ForbiddenException('Limit amount exceds the wallet max value').getBody())
    )
  })

  test('It should be throw ForbiddenExeption for amount min greater or equal used limit', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      },
      body: {
        limitAmount: 10
      }
    }
    spyedGetWallet.mockImplementationOnce(async () => Promise.resolve(wallets))

    vi.spyOn(CardRepository.prototype, 'getOne')
      .mockImplementationOnce(async () => Promise.resolve(cards[0]))
      .mockImplementationOnce(async () => Promise.resolve(cards[1]))
      .mockImplementationOnce(async () => Promise.resolve(cards[2]))

    const result = await setWalletLimitHandler(event, {})
    expect(result.statusCode).toBe(403)
    expect(result.body).toBe(
      JSON.stringify(new ForbiddenException('Limit min should be greater or equal to 100').getBody())
    )
  })

  test('It should be update limit correctly', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      },
      body: {
        limitAmount: 250
      }
    }
    spyedGetWallet.mockImplementationOnce(async () => Promise.resolve(wallets))

    vi.spyOn(CardRepository.prototype, 'getOne')
      .mockImplementationOnce(async () => Promise.resolve(cards[0]))
      .mockImplementationOnce(async () => Promise.resolve(cards[1]))
      .mockImplementationOnce(async () => Promise.resolve(cards[2]))
      .mockImplementationOnce(async () => Promise.resolve(cards[0]))
      .mockImplementationOnce(async () => Promise.resolve(cards[1]))
      .mockImplementationOnce(async () => Promise.resolve(cards[2]))

    vi.spyOn(WalletRepository.prototype, 'save').mockImplementation(async () => Promise.resolve(wallets[0]))

    const result = await setWalletLimitHandler(event, {})
    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(JSON.stringify(wallets[0]))
  })
})
