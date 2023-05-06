import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { dynamoClient } from '@clients/dynamoDbClient'
import NotFoundException from '@exceptions/notFoundException'
import { type Wallet } from '@schemas/walletSchema'

class WalletModel {
  private readonly wallet: Wallet

  public constructor (wallet: Wallet) {
    this.wallet = wallet
  }

  public async createWallet (): Promise<Wallet> {
    return dynamoClient.send(new PutCommand({
      TableName: `${process.env.DYNAMODB_TABLE_PREFIX}-wallets`,
      Item: this.wallet
    })).then(() => this.wallet)
  }

  public static async getById (id: string, userId: string): Promise<Wallet[]> {
    const wallets = await dynamoClient.send(new QueryCommand({
      TableName: `${process.env.DYNAMODB_TABLE_PREFIX}-wallets`,
      IndexName: 'userId-index',
      KeyConditionExpression: 'id = :id AND userId = :userId',
      ExpressionAttributeValues: {
        ':id': id,
        ':userId': userId
      }
    })).then(({ Items }) => Items as Wallet[])

    if (!wallets.length) {
      throw new NotFoundException('Wallet not found')
    }

    return wallets
  }

  public static async getByUserId (userId: string): Promise<Wallet[]> {
    const wallets = await dynamoClient.send(new QueryCommand({
      TableName: `${process.env.DYNAMODB_TABLE_PREFIX}-wallets`,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId }
    })).then(({ Items }) => Items as Wallet[])

    if (!wallets.length) {
      throw new NotFoundException('Wallets not found')
    }

    return wallets
  }
}

export default WalletModel
