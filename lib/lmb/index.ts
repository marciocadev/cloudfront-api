import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda"

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log(JSON.stringify(event, undefined, 2));
  return {
    statusCode: 200,
    body: "ok",
    headers: {
      "context-type": "application/json"
    }
  }
}