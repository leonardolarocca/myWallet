import Exception from './exception'

class NotAcceptableException extends Exception {
  public constructor (err: string = 'Not Acceptable') {
    super(406, 'not-acceptable', err, 4)
    this.body.message = err
  }
}

export default NotAcceptableException
