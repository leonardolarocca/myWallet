import { type User } from '@schemas/userSchema'

import BaseRepository from './baseRepository'

class UserRepository extends BaseRepository<User> {
  public constructor () {
    super('users', 'id')
  }
}

export default UserRepository
