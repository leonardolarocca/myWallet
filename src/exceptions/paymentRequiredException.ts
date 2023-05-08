import Exception from './exception'

class PaymentRequiredException extends Exception {
  public constructor (err: string = 'Payment Required') {
    super(402, 'payment-required', err, 6)
    this.body.message = err
  }
}

export default PaymentRequiredException
