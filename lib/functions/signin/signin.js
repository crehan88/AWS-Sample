const utils = require('/opt/commonLayer-lambda')
let config = require('aws-sdk').config
config.update({ region: 'us-east-1' })

exports.handler = async function (event) {
  let response = {
    "statusCode": 500,
    "headers": {
      'Access-Control-Allow-Origin': '*',
    },
  }

  let body = JSON.parse(event.body)
  if (body.name) {
    let name = body.name.toLowerCase().replace(/\s/g, '')
    let admin = checkIfAdmin(body, name)
    response = admin ? admin : await checkName(name)
  } else if (body.email) {
    let email = body.email.toLowerCase()
    response = await checkEmail(email)
  }

  return response
}

function checkIfAdmin(body, name) {
  let response = {
    "statusCode": 500,
    "headers": {
      'Access-Control-Allow-Origin': '*',
    },
  }
  if (name === process.env.name) {
    let password = body.password
    if (password === process.env.password) {
      let jwt = utils.jwtEncoding(name + password)
      response = {
        "statusCode": 200,
        "headers": {
          'authorization': jwt,
          'Access-Control-Expose-Headers': '*',
          'Access-Control-Allow-Origin': '*',
        }
      }
    } else {
      response = {
        "statusCode": 203,
        "headers": {
          'Access-Control-Allow-Origin': '*',
        }
      }
    }
    return response
  }
  return false
}

async function addVisit(name, invitesList) {
  invitesList.map((person) => {
     if (name === person.name.replace(/\s/g, '')) {
       let d = new Date().toLocaleString("en-US", {timeZone: 'America/Vancouver'})
       person.visited = `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}`
     }
   })
   let updated = utils.updateInvites(invitesList)
   await updated.catch((err) => {
     console.log('S3 write object error :', err)
   })
}

async function checkName(name) {
  let response = {
    "statusCode": 500,
    "headers": {
      'Access-Control-Allow-Origin': '*'
    },
  }
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
    let found = invitesList.find((person) => person.name.toLowerCase().replace(/\s/g, '') === name)
    if (found) {
      await addVisit(found.name, invitesList)
      let jwt = utils.jwtEncoding(found.name)
      response = {
        "statusCode": 200,
        "headers": {
          'authorization': jwt,
          'Access-Control-Expose-Headers': '*',
          'Access-Control-Allow-Origin': '*',
        },
        "body": JSON.stringify(found),
        "isBase64Encoded": false,
      }
    } else {
      response = {
        "statusCode": 203,
        "headers": {
          'Access-Control-Allow-Origin': '*',
        },
      }
    }
  }
  return response
}

async function checkEmail(email) {
  let response = {
    "statusCode": 500,
  }
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
          'Access-Control-Allow-Origin': '*',
        },
      }
    })
  if (invitesList.statusCode) {
    response = invitesList
  } else {
    let found = invitesList.find((person) => person.email === email)
    if (found) {
      await addVisit(found.name, invitesList)
      let jwt = utils.jwtEncoding(found.name)
      response = {
        "statusCode": 200,
        "headers": {
          'authorization': jwt,
          'Access-Control-Expose-Headers': '*',
          'Access-Control-Allow-Origin': '*',
        },
        "body": JSON.stringify(found),
        "isBase64Encoded": false,
      }
    } else {
      response = {
        "statusCode": 203,
        "headers": {
          'Access-Control-Allow-Origin': '*'
        },
      }
    }
  }
  return response
}




