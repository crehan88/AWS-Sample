import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as apigw from '@aws-cdk/aws-apigateway'
import * as logs from '@aws-cdk/aws-logs'
import * as iam from '@aws-cdk/aws-iam'
import * as path from 'path'

interface RestEndPointProps {
  id: string
  function: string
  layers: [lambda.LayerVersion]
  api: apigw.RestApi
  method: string
  endpoint: string
  bucketArn: string
  auth?: apigw.Authorizer
  env?: {}
}

export class RestEndPointConstruct extends cdk.Construct {
  constructor(scope: cdk.Stack, id: string, props: RestEndPointProps) {
    super(scope, id)

    let lambdaFunction: lambda.Function

    const LambdaRole = new iam.Role(this, 'lambdaS3Role', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        wedsiteinvite: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:ListBucket'],
              resources: ['*'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:GetObject', 's3:PutObject'],
              resources: ['*'],
            }),
          ],
        }),
        logging: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['logs:CreateLogStream', 'logs:PutLogEvents'],
              resources: [
                '*'
              ],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['logs:CreateLogGroup'],
              resources: ['*'],
            }),
          ],
        }),
      },
    })

    if (props.env) {
      lambdaFunction = new lambda.Function(this, props.id + 'Function', { 
        functionName: props.id, 
        runtime: lambda.Runtime.NODEJS_14_X,
        code: lambda.Code.fromAsset(
          path.join(__dirname, '../functions/', props.function)
        ),
        handler: `${props.id}.handler`,
        role: LambdaRole,
        logRetention: logs.RetentionDays.ONE_DAY,
        layers: props.layers,
        environment: props.env,
      })
    } else {
      lambdaFunction = new lambda.Function(this, props.id + 'Function', {
        runtime: lambda.Runtime.NODEJS_14_X,
        code: lambda.Code.fromAsset(
          path.join(__dirname, '../functions/', props.function)
        ),
        handler: `${props.id}.handler`,
        role: LambdaRole,
        logRetention: logs.RetentionDays.ONE_DAY,
        layers: props.layers,
      })
    }

    const endpoint = props.api.root.addResource(props.endpoint, {
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'],
        exposeHeaders: ['*'],
        allowHeaders: ['*'],
      },
    })

    if (props.auth) {
      endpoint.addMethod(
        props.method,
        new apigw.LambdaIntegration(lambdaFunction),
        {
          apiKeyRequired: true,
          authorizer:props.auth
        }
      )
    } else {
      endpoint.addMethod(
        props.method,
        new apigw.LambdaIntegration(lambdaFunction),
        {
          apiKeyRequired: true,
        }
      )
    }
  }
}
