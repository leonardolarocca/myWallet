import Exception from './exception'

class UnprocessableException extends Exception {
  public constructor (err: any) {
    super(422, 'unprocessable-entity', err, 8)
    this.body.message = err
  }
}

export default UnprocessableException
