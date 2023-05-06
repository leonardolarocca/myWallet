import apiGwEvent from '@seeds/apiGwEvent.json'
import wallets from '@seeds/wallets.json'
import { setWalletLimitHandler } from 'src'
import { describe, test, expect, beforeAll, vi } from 'vitest'

beforeAll(() => {
  vi.spyOn(setWalletLimitHandler, 'use').mockImplementation(async () => {
    return Promise.resolve({})
  })
})

describe('setWalletLimitHandler', () => {
  test('It should update limit correctly', async () => {
    const event = {
      ...apiGwEvent,
      body: {
        limitAmount: 10
      },
      pathParameters: {
        userId: wallets[0].userId,
        walletId: wallets[0].id
      },
      wallet: wallets[0]
    }
    const result = await setWalletLimitHandler(event, {})
    expect(result).toBe(200)
  })
})
