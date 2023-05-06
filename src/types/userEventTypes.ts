import { type User } from '@schemas/userSchema'

import { type Event } from './eventType'

export type GetUser = Omit<Event<null>, 'pathParameters'> & {
  pathParameters: {
    userId: string
  }
}

export type CreateUser = Event<User>
