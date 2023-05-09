import NotFoundException from '@exceptions/notFoundException'
import BaseRepository from '@repositories/baseRepository'
import apiGwEvent from '@seeds/apiGwEvent.json'
import users from '@seeds/users.json'
import { createUserHandler, getUserHandler } from 'src'
import { describe, test, vi, expect } from 'vitest'

describe('createUser', () => {
  test('It should create user correctly', async () => {
    const event = {
      ...apiGwEvent,
      body: {
        name: users[0].name
      }
    }

    vi.spyOn(BaseRepository.prototype, 'save').mockImplementation(async () => {
      return Promise.resolve(users[0])
    })

    const response = await createUserHandler(event, {})
    expect(response.statusCode).toBe(200)
    expect(response.body).toBe(JSON.stringify(users[0]))
  })

  test('It should be return error 422 for create user with wrong schema', async () => {
    const response = await createUserHandler(apiGwEvent, {})
    expect(response.statusCode).toBe(422)
  })
})

describe('getUser', () => {
  test('It should be return a user correctly', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: users[0].id
      }
    }

    vi.spyOn(BaseRepository.prototype, 'getOne')
      .mockImplementationOnce(async () => Promise.resolve(users[0]))

    const response = await getUserHandler(event, {})
    expect(response.statusCode).toBe(200)
    expect(response.body).toBe(JSON.stringify(users[0]))
  })

  test('It should be return 404 error for not found user', async () => {
    const event = {
      ...apiGwEvent,
      pathParameters: {
        userId: '123'
      }
    }

    vi.spyOn(BaseRepository.prototype, 'getOne')
      .mockImplementationOnce(async () => Promise.resolve(undefined))

    const response = await getUserHandler(event, {})
    expect(response.statusCode).toBe(404)
    expect(response.body).toBe(JSON.stringify(new NotFoundException('User not found').getBody()))
  })
})
