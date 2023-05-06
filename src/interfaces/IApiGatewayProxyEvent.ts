interface IApiGatewayProxyEvent {
  body: any
  headers: Record<string, string>
  pathParameters: Record<string, string>
  queryStringParameters: Record<string, string>
}

export default IApiGatewayProxyEvent
