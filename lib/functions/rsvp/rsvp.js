let config = require('aws-sdk').config
config.update({ region: 'us-east-1' })
const utils = require('/opt/commonLayer-lambda')

exports.handler = async function (event) {
  let response = {
    "statusCode": 500,
    "headers":{
      "Access-Control-Allow-Origin": '*'
    }
  }
  const rsvp = JSON.parse(event.body)
 
  let invitesList = await utils
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
          'Access-Control-Allow-Origin': '*'
        }
      }
    })
    
  if (invitesList.statusCode) {
    response = invitesList
  } else {
    await addRsvp(rsvp, invitesList)
    response = {
        "statusCode": 200,
        "headers": {
          'Access-Control-Allow-Origin': '*'
        }
      }
  }
 return response
}

async function addRsvp(rsvp, invitesList) {
  invitesList.map((person) => {
     if (rsvp.name.toLowerCase().replace(/\s/g, '') === person.name.toLowerCase().replace(/\s/g, '')) {
       person.response = rsvp.response
       person.email = rsvp.email
     }
   })
   let updated = utils.updateInvites(invitesList)
   await updated.catch((err) => {
     console.log('S3 write object error :', err)
   })
}


