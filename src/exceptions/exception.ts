import type IErrorResponse from '@interfaces/IErrorResponse'

class Exception extends Error {
  protected statusCode: number
  protected body: IErrorResponse

  public constructor (status: number, code: string, message: any, errorCode?: number) {
    super(message)
    this.body = {
      code,
      errorCode,
      message
    }
    this.statusCode = status
  }

  public getStatusCode (): number {
    return this.statusCode
  }

  public getBody (): IErrorResponse {
    return this.body
  }
}

export default Exception
