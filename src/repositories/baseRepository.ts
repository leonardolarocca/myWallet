import { DeleteCommand, type DeleteCommandOutput, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { dynamoClient } from '@clients/dynamoDbClient'
import type IBaseRepository from '@interfaces/IBaseRepository'

abstract class BaseRepository<T> implements IBaseRepository<T> {
  protected readonly tableName: string
  protected readonly key: string

  public constructor (tableName: string, key: string) {
    this.tableName = `${process.env.DYNAMODB_TABLE_PREFIX}-${tableName}`
    this.key = key
  }

  public async getOne (id: any): Promise<T> {
    return dynamoClient.send(new GetCommand({
      TableName: this.tableName,
      Key: { [this.key]: id }
    })).then(({ Item }) => Item as T)
  }

  public async delete (id: any): Promise<DeleteCommandOutput> {
    return dynamoClient.send(new DeleteCommand({
      TableName: this.tableName,
      Key: { [this.key]: id }
    }))
  }

  public async save (data: any): Promise<T> {
    return dynamoClient.send(new PutCommand({
      TableName: this.tableName,
      Item: data
    })).then(() => data as T)
  }
}

export default BaseRepository
