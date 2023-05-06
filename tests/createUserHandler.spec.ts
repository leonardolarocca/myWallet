import { createUser } from '@handlers/userHandler'
import UserRepository from '@repositories/userRepository'
import users from '@seeds/users.json'
import { describe, test, beforeAll, vi, expect } from 'vitest'

beforeAll(() => {
  vi.spyOn(UserRepository.prototype, 'save').mockImplementation(async () => {
    return Promise.resolve(users[0])
  })
})

describe('createUser', () => {
  test('It should creater user correctly', async () => {
    const { name } = users[0]
    const result = await createUser({ body: { name } })
    expect(result).toEqual(users[0])
  })
})
