let config = require('aws-sdk').config
config.update({ region: 'us-east-1' })
const utils = require('/opt/commonLayer-lambda')

exports.handler = async function (event) {
  let response = {
    "statusCode": 500,
    "headers": {
      'Access-Control-Allow-Origin': '*',
    },
  }
  
  const name = event.body

  const invitesList = await utils
    .getInvites()
    .then((data) => {
      let unParsedData = data.Body.toString('utf-8')
      return JSON.parse(unParsedData)
    })
    .catch((err) => {
      console.log('error :', err)
      return {
        "statusCode": 500,
        "headers": {
          'Access-Control-Allow-Origin': '*',
        },
      }
    })

  if (invitesList.statusCode) {
    response = invitesList
  } else {
    let found = checkName(name, invitesList)
    let res = found ? await removeInvite(name, invitesList) : 203
    if(res === 203){
      response = {
      "statusCode":203,
      "headers":{
      "Access-Control-Allow-Origin":"*"
    }
    }
    }else if(res === 500){
      response = {
        "statusCode":500,
        "headers":{
          "Access-Control-Allow-Origin":"*"
        }
      }
    }else{
      response = res
    }
  }
  return response
}

async function removeInvite(name, invitesList) {
  const newList = invitesList.filter((person) => person.name.toLowerCase().replace(/\s/g, '') !== name.toLowerCase().replace(/\s/g, ''))
  return await utils
    .updateInvites(newList)
    .then(() =>{
      return {
        "statusCode": 200,
        "headers":{
          "Access-Control-Allow-Origin": "*"
        },
        "body":name
      }
    })
    .catch((err) => {
      console.log('err :', err)
      return 500
    })
}

function checkName(name, invitesList) {
  let found = invitesList.find((invite) => invite.name.toLowerCase().replace(/\s/g, '') == name.toLowerCase().replace(/\s/g, ''))
  return found ? true : false
}


