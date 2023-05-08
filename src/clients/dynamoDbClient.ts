import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

let options = {}

// eslint-disable-next-line no-extra-boolean-cast
if (Boolean(process.env.IS_OFFLINE)) {
  options = {
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  }
}

export const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient(options), {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: true
  }
})
