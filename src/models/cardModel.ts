import { DeleteCommand, type DeleteCommandOutput, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { dynamoClient } from '@clients/dynamoDbClient'
import { type Card } from '@schemas/cardSchema'

class CardModel {
  private readonly card: Card

  public constructor (card: Card) {
    this.card = card
  }

  public get (): Card {
    return this.card
  }

  public async save (): Promise<Card> {
    return dynamoClient.send(new PutCommand({
      TableName: `${process.env.DYNAMODB_TABLE_PREFIX}-cards`,
      Item: this.card
    })).then(() => this.card)
  }

  public static async getById (number: string): Promise<Card> {
    return dynamoClient.send(new GetCommand({
      TableName: `${process.env.DYNAMODB_TABLE_PREFIX}-cards`,
      Key: { number }
    })).then(({ Item }) => Item as Card)
  }

  public static async removeById (number: string): Promise<DeleteCommandOutput> {
    return dynamoClient.send(new DeleteCommand({
      TableName: `${process.env.DYNAMODB_TABLE_PREFIX}-cards`,
      Key: { number }
    }))
  }
}

export default CardModel
