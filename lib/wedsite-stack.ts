import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment'
import * as cdk from '@aws-cdk/core';


interface WedSiteStackProps extends cdk.StackProps{
  domain: string
}


export class WedSiteStack extends cdk.Stack {

  public siteBucket: s3.Bucket;

  constructor(scope: cdk.App, id: string, props: WedSiteStackProps) {
    super(scope, id);
  
    this.siteBucket = new s3.Bucket(this, "websitebucket",{
      bucketName: props.domain,
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,        
      websiteIndexDocument: "index.html",
    });

    new s3Deployment.BucketDeployment(this, 'DeployBucketWithSite', {
      sources: [s3Deployment.Source.asset('./site/build')],
      destinationBucket: this.siteBucket,
    });

  }

}
