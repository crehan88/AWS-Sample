let S3 = require('aws-sdk').S3
const jwt = require('jsonwebtoken')

let s3 = new S3({ apiVersion: '2006-03-01' })

exports.getInvites = function () {
  return s3
    .getObject({
      Bucket: 'invitedata',
      Key: 'invitedpersons.json',
    })
    .promise()
}

exports.updateInvites = function (invites) {
  return s3.putObject({
    Bucket: 'invitedata',
    Key: 'invitedpersons.json',
    Body: JSON.stringify(invites),
  }).promise()
}

exports.jwtEncoding = function (name) {
  return jwt.sign( name , process.env.secret)
}

exports.jwtDecoding = function (token) {
  return jwt.verify( token , process.env.secret)
}

