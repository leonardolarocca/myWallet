import NotFoundException from '@exceptions/notFoundException'
import UserRepository from '@repositories/userRepository'
import { type APIGatewayProxyResult } from 'aws-lambda'
import { v4 } from 'uuid'

import { type CreateUser, type GetUser } from '../types/userEventTypes'

export const getUser = async (event: GetUser): Promise<APIGatewayProxyResult> => {
  const user = await new UserRepository().getOne(event.pathParameters.userId)

  if (!user) {
    throw new NotFoundException('User not found')
  }

  return {
    body: JSON.stringify(user),
    statusCode: 200
  }
}

export const createUser = async (event: CreateUser): Promise<APIGatewayProxyResult> => {
  const createdUser = await new UserRepository().save({
    id: v4(),
    name: event.body.name,
    wallets: []
  })

  return {
    body: JSON.stringify(createdUser),
    statusCode: 200
  }
}
