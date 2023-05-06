import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { dynamoClient } from '@clients/dynamoDbClient'
import NotFoundException from '@exceptions/notFoundException'
import { type User } from '@schemas/userSchema'

import WalletModel from './walletModel'

class UserModel {
  private readonly user: User

  public constructor (user: User) {
    this.user = user
  }

  public async createUser (): Promise<User> {
    return dynamoClient.send(new PutCommand({
      TableName: `${process.env.DYNAMODB_TABLE_PREFIX}-users`,
      Item: this.user
    })).then(() => this.user)
  }

  public static async getById (id: string): Promise<User> {
    const wallets = (await WalletModel.getByUserId(id)).map(wallet => wallet.id)
    const user = await dynamoClient.send(new GetCommand({
      TableName: `${process.env.DYNAMODB_TABLE_PREFIX}-users`,
      Key: { id }
    })).then(({ Item }) => Item as User)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return { ...user, wallets }
  }
}

export default UserModel
