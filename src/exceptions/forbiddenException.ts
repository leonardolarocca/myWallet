import Exception from './exception'

class ForbiddenException extends Exception {
  public constructor (err: string = 'Forbidden') {
    super(403, 'forbidden', err, 2)
    this.body.message = err
  }
}

export default ForbiddenException
