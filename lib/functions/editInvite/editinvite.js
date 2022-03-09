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

  const body = JSON.parse(event.body);
  const oldName = body.oldName;
  const newName = body.newName;
  
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
    let found = checkName(oldName, invitesList)
    let statusCode = found ? await updateInvite(oldName,newName,invitesList) : 203
    response = {
       "statusCode": statusCode,
    "headers": {
      'Access-Control-Allow-Origin': '*',
    },
    }
  }
  return response
}

async function updateInvite(oldName,newName, invitesList) {
  const newList = invitesList.map(invite => {
    if(oldName.toLowerCase().replace(/\s/g, '') == invite.name.toLowerCase().replace(/\s/g, '')){
      invite.name = newName
      return invite
    }
    return invite
  })

 return await utils
    .updateInvites(newList)
    .then(() => {
      return 200
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


