import NotFoundException from '@exceptions/notFoundException'
import type IApiGatewayProxyEvent from '@interfaces/IApiGatewayProxyEvent'
import UserModel from 'src/models/userModel'
import { v4 } from 'uuid'

class UserFunctions {
  private readonly userModel: UserModel

  public constructor () {
    this.userModel = new UserModel()
    this.getUserInfo = this.getUserInfo.bind(this)
    this.createUser = this.createUser.bind(this)
  }

  public async getUserInfo (event: IApiGatewayProxyEvent): Promise<Record<string, any> | undefined> {
    const { userId } = event.pathParameters ?? {}
    return this.userModel.getOne({ id: userId }).then(({ Item }) => {
      if (Item == null) {
        throw new NotFoundException()
      }
      return Item
    })
  }

  public async createUser (event: IApiGatewayProxyEvent): Promise<Record<string, any>> {
    const { name } = event.body ?? {}
    const user = {
      id: v4(),
      name,
      wallets: []
    }
    return this.userModel.create(user).then(() => (user))
  }
}

export default UserFunctions
