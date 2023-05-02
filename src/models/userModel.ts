import BaseRepository from 'src/repositories/baseRepository'

class UserModel extends BaseRepository {
  public constructor () {
    super(`${process.env.DYNAMODB_TABLE_PREFIX}-users`)
  }
}

export default UserModel
