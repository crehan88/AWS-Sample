const utils = require('/opt/commonLayer-lambda')
let config = require('aws-sdk').config
config.update({ region: 'us-east-1' })

exports.handler = function (event, context ,callback) {
  const name = utils.jwtDecoding(event.authorizationToken)

  switch (name) {
    case process.env.name + process.env.password:
      callback(null, generatePolicy('admin', 'Allow', event.methodArn))
      break
    default:
      callback('Error: Invalid token') 

  }
}

let generatePolicy = function (principalId, effect, resource) {
  let authResponse = {}

  authResponse.principalId = principalId
  if (effect && resource) {
    var policyDocument = {}
    policyDocument.Version = '2012-10-17'
    policyDocument.Statement = []
    var statementOne = {}
    statementOne.Action = 'execute-api:Invoke'
    statementOne.Effect = effect
    statementOne.Resource = resource
    policyDocument.Statement[0] = statementOne
    authResponse.policyDocument = policyDocument
  }

  return authResponse
}




