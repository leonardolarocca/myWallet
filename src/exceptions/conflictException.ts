import Exception from './exception'

class ConflictException extends Exception {
  public constructor (err: string = 'Resource not found') {
    super(409, 'conflict', err, 1)
    this.body.message = err
  }
}

export default ConflictException
