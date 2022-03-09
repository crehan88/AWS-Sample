const utils = require('/opt/commonLayer-lambda')
let config = require('aws-sdk').config
config.update({ region: 'us-east-1' })

exports.handler = function (event, context,callback) {
  const name = utils.jwtDecoding(event.authorizationToken)
  const found = checkAuth(name)

  if (found.statusCode === 500) {
    callback('Error: Invalid token') 
  } else if (found) {
    callback(null, generatePolicy('visiter', 'Allow', event.methodArn))
  } else {
    callback('Unauthorized') 
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

async function checkAuth(name) {
  let invitesList = await utils.getInvites()
    .then((data) => {
      console.log('S3 Get Object Success')
      let unParsedData = data.Body.toString('utf-8')
      return JSON.parse(unParsedData)
    })
    .catch((err) => {
      console.log('error :', err)
      return {
        statusCode: 500,
      }
    })

  if (invitesList.statusCode) {
    return invitesList
  } else {
    let found = invitesList.find((person) => person.name == name)
    if (found) {
      return true
    } else {
      return false
    }
  }
}

