import { GetCommand, PutCommand, type GetCommandOutput, type PutCommandOutput, type DeleteCommandOutput, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { dynamoClient } from '@clients/dynamoDbClient'

abstract class BaseRepository {
  public tableName: string

  public constructor (tableName: string) {
    this.tableName = tableName
  }

  public async getOne (key: Record<string, any>): Promise<GetCommandOutput> {
    return dynamoClient.send(new GetCommand({
      TableName: this.tableName,
      Key: key
    }))
  }

  public async create (data: Record<string, any>): Promise<PutCommandOutput> {
    return dynamoClient.send(new PutCommand({
      TableName: this.tableName,
      Item: data
    }))
  }

  public async destroy (key: Record<string, any>): Promise<DeleteCommandOutput> {
    return dynamoClient.send(new DeleteCommand({
      TableName: this.tableName,
      Key: key
    }))
  }
}

export default BaseRepository
