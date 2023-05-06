import Exception from './exception'

class NotFoundException extends Exception {
  public constructor (err: string = 'Resource not found') {
    super(404, 'not-found', err, 5)
    this.body.message = err
  }
}

export default NotFoundException
