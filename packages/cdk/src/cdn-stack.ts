import { Stack } from 'aws-cdk-lib'
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import {
  Distribution,
  Function,
  FunctionCode,
  FunctionEventType,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront'
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins'
import {
  ARecord,
  HostedZone,
  RecordTarget,
} from 'aws-cdk-lib/aws-route53'
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import {
  BucketDeployment,
  Source,
} from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from 'constructs'
import { CommonStackProps } from './types.js'
import {
  WEBPACK_MANIFEST_FILE_NAME,
  getDefaultRootObject,
  getExtensions,
  getWebpackDistPath,
} from './webpack-manifest.js'

export interface CdnStackProps extends CommonStackProps {
  certificate: Certificate
  demoHostedZone: HostedZone
}

export class CdnStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    {
      domain,
      certificate,
      demoHostedZone,
      ...props
    }: CdnStackProps,
  ) {
    super(scope, id, props)

    const bucket = new Bucket(this, 'Bucket', {
      bucketName: domain.demo,
    })

    const originAccessIdentity = new OriginAccessIdentity(
      this,
      'OriginAccessIdentity',
    )

    // If the request doesn't match a list of extensions we
    // get from the webpack manifest, assume it's a client
    // side route and return the index.html
    //
    const defaultToIndexHtmlFunction = new Function(
      this,
      'DefaultToIndexHtmlFunction',
      {
        // prettier-ignore
        code: FunctionCode.fromInline(`
          function handler(event) {
            var request = event.request
            var uri = request.uri
            if (uri.match(/\.(${getExtensions().join('|')})$/)) {
              return request
            }
            request.uri = '/'
            return request
          }
        `),
      },
    )

    const distribution = new Distribution(
      this,
      'Distribution',
      {
        defaultBehavior: {
          origin: new S3Origin(bucket, {
            originAccessIdentity,
          }),
          viewerProtocolPolicy:
            ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          functionAssociations: [
            {
              function: defaultToIndexHtmlFunction,
              eventType: FunctionEventType.VIEWER_REQUEST,
            },
          ],
        },
        defaultRootObject: getDefaultRootObject(),
        domainNames: [domain.demo],
        certificate,
      },
    )

    new BucketDeployment(this, 'BucketDeployment', {
      sources: [
        Source.asset(getWebpackDistPath(), {
          exclude: [WEBPACK_MANIFEST_FILE_NAME],
        }),
      ],
      destinationBucket: bucket,
      prune: true,
    })

    new ARecord(this, 'AliasRecord', {
      zone: demoHostedZone,
      target: RecordTarget.fromAlias(
        new CloudFrontTarget(distribution),
      ),
    })
  }
}
