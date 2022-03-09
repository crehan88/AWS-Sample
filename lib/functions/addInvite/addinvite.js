let config = require('aws-sdk').config
config.update({ region: 'us-east-1' })
const utils = require('/opt/commonLayer-lambda')

exports.handler = async function (event) {
  let response = {
    "statusCode": 500,
    "headers":{
      "Access-Control-Allow-Origin":"*"
    }
  }
  
  const name = JSON.parse(event.body).name

 const invitesList = await utils.getInvites().then(data => {
    let unParsedData = data.Body.toString('utf-8')
      return JSON.parse(unParsedData)
    }).catch((err) => {
      console.log('error :', err)
      return {
        "statusCode": 500,
        "headers":{
      "Access-Control-Allow-Origin":"*"
    }
      }
    })
    
  if(invitesList.statusCode){
    response = invitesList
  }else{
    let found = checkName(name,invitesList)
    let res = found ? 203 : await addInvite(name,invitesList)
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

async function addInvite(person, invitesList) {
  let invite = {
    "name": person,
    "email": "",
    "response":"maybe",
    "visited":""
  }
  invitesList.push(invite)
  return await utils.updateInvites(invitesList)
    .then(() => {
      return {
        "statusCode": 200,
        "headers":{
          "Access-Control-Allow-Origin": "*"
        },
        "body":JSON.stringify(invite)
      }
    })
    .catch((err) => {
      console.log('err :', err)
      return 500
    })
}

function checkName(name,invitesList){
  let found = invitesList.find(invite => invite.name.toLowerCase().replace(/\s/g, '') == name.toLowerCase().replace(/\s/g, ''))
  return found ? true : false
}




