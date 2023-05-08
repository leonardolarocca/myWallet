import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { dynamoClient } from '@clients/dynamoDbClient'
import { type Wallet } from '@schemas/walletSchema'

import BaseRepository from './baseRepository'

class WalletRepository extends BaseRepository<Wallet> {
  public constructor () {
    super('wallets', 'id')
  }

  public async getWalletByIdAndUserId (walletId: string, userId: string): Promise<Wallet[]> {
    return dynamoClient.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'userId-index',
      KeyConditionExpression: 'id = :id AND userId = :userId',
      ExpressionAttributeValues: {
        ':id': walletId,
        ':userId': userId
      }
    })).then(({ Items }) => Items as Wallet[])
  }

  public async getAllWalletsFromUserId (userId: string): Promise<Wallet[]> {
    return dynamoClient.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId }
    })).then(({ Items }) => Items as Wallet[] ?? [])
  }
}

export default WalletRepository
