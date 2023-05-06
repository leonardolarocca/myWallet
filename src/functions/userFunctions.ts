import type IApiGatewayProxyEvent from '@interfaces/IApiGatewayProxyEvent'
import UserModel from '@models/userModel'
import { type User } from '@schemas/userSchema'
import { v4 } from 'uuid'

export const getUserInfo = async (event: IApiGatewayProxyEvent): Promise<User> => {
  return UserModel.getById(event.pathParameters.userId)
}

export const createUser = async (event: IApiGatewayProxyEvent): Promise<User> => {
  const user = new UserModel({ id: v4(), wallets: [], ...event.body })
  return user.createUser()
}
