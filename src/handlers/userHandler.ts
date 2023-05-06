import UserRepository from '@repositories/userRepository'
import { type User } from '@schemas/userSchema'
import { v4 } from 'uuid'

import { type CreateUser, type GetUser } from '../types/userEventTypes'

export const getUser = async (event: GetUser): Promise<User> => {
  return new UserRepository().getOne(event.pathParameters.userId)
}

export const createUser = async (event: CreateUser): Promise<User> => {
  return new UserRepository().save({
    id: v4(),
    name: event.body.name,
    wallets: []
  })
}
