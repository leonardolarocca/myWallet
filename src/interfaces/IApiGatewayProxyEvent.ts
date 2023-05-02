interface IApiGatewayProxyEvent {
  body: Record<string, any> | undefined
  headers: Record<string, string> | undefined
  pathParameters: Record<string, string> | undefined
  queryStringParameters: Record<string, string> | undefined
}

export default IApiGatewayProxyEvent
