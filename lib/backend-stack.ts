import * as cdk from '@aws-cdk/core'
import * as logs from '@aws-cdk/aws-logs'
import * as s3 from '@aws-cdk/aws-s3'
import * as s3Deployment from '@aws-cdk/aws-s3-deployment'
import * as apigw from '@aws-cdk/aws-apigateway'
import * as iam from '@aws-cdk/aws-iam'
import * as lambda from '@aws-cdk/aws-lambda'
import * as path from 'path'
import { RestEndPointConstruct } from './constructs/RestEndPoint-construct'

interface BackEndStackInterface extends cdk.StackProps {}

export class BackEndStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: BackEndStackInterface) {
    super(scope, id, props)

    const bucket = new s3.Bucket(this, 'invitedata', {
      bucketName: 'invitedata',
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    })

    new s3Deployment.BucketDeployment(this, 'DeployInvitedBucket', {
      sources: [s3Deployment.Source.asset('./buckets')],
      destinationBucket: bucket,
    })

    const api = new apigw.RestApi(this, 'WedSiteApi', {
      policy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['execute-api:Invoke'],
            resources: ['arn:aws:execute-api:us-east-1:*'],
            principals: [new iam.AnyPrincipal()],
          }),
        ],
      }),
    })

    const plan = api.addUsagePlan('development', {
      name: 'development',
      quota: {
        limit: 30,
        period: apigw.Period.DAY,
      },
      throttle: {
        rateLimit: 10,
        burstLimit: 10,
      },
    })
    const apikey = api.addApiKey('devKey')
    plan.addApiKey(apikey)
    plan.addApiStage({
      stage: api.deploymentStage,
    })

    const commonLayer = new lambda.LayerVersion(this, 'commonLayer', {
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
      code: lambda.Code.fromAsset(path.join(__dirname, 'commonLayer')),
    })

    const adminAuthLambdaFunction = new lambda.Function(
      this,
      'AdminAuthFunction',
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        code: lambda.Code.fromAsset(
          path.join(__dirname, 'authorizers/manager')
        ),
        handler: 'managerAuth.handler',
        logRetention: logs.RetentionDays.ONE_DAY,
        layers: [commonLayer],
        environment: {
          secret: scope.node.tryGetContext('secret'),
          name: scope.node.tryGetContext('admin'),
          password: scope.node.tryGetContext('password'),
        },
      }
    )

    const visiterAuthLambdaFunction = new lambda.Function(
      this,
      'VisiterAuthFunction',
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        code: lambda.Code.fromAsset(
          path.join(__dirname, 'authorizers/visiter')
        ),
        handler: 'visiterAuth.handler',
        logRetention: logs.RetentionDays.ONE_DAY,
        layers: [commonLayer],
        environment: {
          secret: scope.node.tryGetContext('secret'),
        },
      }
    )

    const adminAuth = new apigw.TokenAuthorizer(this, 'adminAuthorizer', {
      handler: adminAuthLambdaFunction,
      identitySource: 'method.request.header.authorization',
    })
    const visiterAuth = new apigw.TokenAuthorizer(this, 'visiterAuthorizer', {
      handler: visiterAuthLambdaFunction,
    })
    new RestEndPointConstruct(this, 'signinendpoint', {
      id: 'signin',
      function: 'signin',
      layers: [commonLayer],
      api: api,
      method: 'POST',
      endpoint: 'signin',
      bucketArn: bucket.bucketArn,
      env: {
        secret: scope.node.tryGetContext('secret'),
        password: scope.node.tryGetContext('password'),
      },
    })

    new RestEndPointConstruct(this, 'rsvpendpoint', {
      id: 'rsvp',
      function: 'rsvp',
      layers: [commonLayer],
      api: api,
      method: 'POST',
      endpoint: 'rsvp',
      bucketArn: bucket.bucketArn,
      auth: visiterAuth,
      env: {},
    })

    new RestEndPointConstruct(this, 'getlistendpoint', {
      id: 'getlist',
      function: 'getList',
      layers: [commonLayer],
      api: api,
      method: 'GET',
      endpoint: 'getinvites',
      bucketArn: bucket.bucketArn,
      auth: adminAuth,
      env: {},
    })

    new RestEndPointConstruct(this, 'addinviteendpoint', {
      id: 'addinvite',
      function: 'addInvite',
      layers: [commonLayer],
      api: api,
      method: 'POST',
      endpoint: 'addinvite',
      bucketArn: bucket.bucketArn,
      auth: adminAuth,
      env: {},
    })

    new RestEndPointConstruct(this, 'removeinviteendpoint', {
      id: 'removeinvite',
      function: 'removeInvite',
      layers: [commonLayer],
      api: api,
      method: 'POST',
      endpoint: 'removeinvite',
      bucketArn: bucket.bucketArn,
      auth: adminAuth,
      env: {},
    })

    new RestEndPointConstruct(this, 'editinviteendpoint', {
      id: 'editinvite',
      function: 'editInvite',
      layers: [commonLayer],
      api: api,
      method: 'POST',
      endpoint: 'editinvite',
      bucketArn: bucket.bucketArn,
      auth: adminAuth,
      env: {},
    })
  }
}
