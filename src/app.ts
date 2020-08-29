interface LambdaResult extends AWSLambda.APIGatewayProxyResult {
  body: any;
}

exports.lambdaHandler = async (event: AWSLambda.APIGatewayEvent): Promise<LambdaResult> => {
  const result: LambdaResult = { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: null };
  try {
    result.body = JSON.stringify({response: 'postive'});
    return result;
  } catch (error) {
    result.statusCode = 500;
    result.body = error.message;

    return result;
  }
};
