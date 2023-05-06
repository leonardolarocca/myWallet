import Exception from './exception'

class UnauthorizedException extends Exception {
  public constructor (err: string = 'Not authorized to perform this request') {
    super(401, 'unauthorized', err, 7)
    this.body.message = err
  }
}

export default UnauthorizedException
