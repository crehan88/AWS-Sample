#!/usr/bin/env node
import * as cdk from '@aws-cdk/core'
import { WedSiteStack } from '../lib/wedsite-stack'
import { BackEndStack } from '../lib/backend-stack'

const app = new cdk.App()

new WedSiteStack(app, 'WedSiteStack', {
  domain: app.node.tryGetContext('domain'),
  stackName: 'wedsitestack',
  env: {
    account: app.node.tryGetContext('accountid'),
    region: app.node.tryGetContext('region'),
  },
})

new BackEndStack(app, 'BackEndStack', {
  stackName: 'backendstack',
  env: {
    account: app.node.tryGetContext('accountid'),
    region: app.node.tryGetContext('region'),
  },
})
