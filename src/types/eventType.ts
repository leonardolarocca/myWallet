import { type Event as MiddyHttpNormalizedEvent } from '@middy/http-event-normalizer'
import { type APIGatewayProxyEvent } from 'aws-lambda'

export type Event<bodyType> = MiddyHttpNormalizedEvent & Omit<APIGatewayProxyEvent, 'body'> & {
  body: bodyType
}
