import Exception from './exception'

class InternalException extends Exception {
  public constructor (err: string = 'Ops! Something went wrong.') {
    super(500, 'internal-exception', err, 3)
  }
}

export default InternalException
