let config = require('aws-sdk').config
config.update({ region: 'us-east-1' })
const utils = require('/opt/commonLayer-lambda')

exports.handler = async function () {
  let response = {
    "statusCode": 500,
    "headers": {
      'Access-Control-Allow-Origin': '*',
    },
  }

  response = await utils
    .getInvites()
    .then((data) => {
      let list = data.Body.toString('utf-8')
      return {
        "statusCode": 200,
        "headers": {
      'Access-Control-Allow-Origin': '*',
    },
        "body": JSON.stringify(list),
        "isBase64Encoded": false,
      }
    })
    .catch((err) => {
      console.log('Error :', err)
      return {
        "statusCode": 500,
        "headers": {
      'Access-Control-Allow-Origin': '*',
    },
      }
    })
  return response
}

