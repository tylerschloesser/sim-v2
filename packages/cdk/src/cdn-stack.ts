import { Stack } from 'aws-cdk-lib'
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import {
  Distribution,
  FunctionAssociation,
  FunctionEventType,
  OriginAccessIdentity,
  ResponseHeadersPolicy,
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
import { DefaultToIndexHtmlFunction } from './default-to-index-html-function.js'
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
          functionAssociations: [defaultToIndexHtml(this)],
          responseHeadersPolicy: new ResponseHeadersPolicy(
            this,
            'ResponseHeadersPolicy',
            {
              customHeadersBehavior: {
                customHeaders: [
                  {
                    header: 'Cross-Origin-Opener-Policy',
                    value: 'same-origin',
                    override: false,
                  },
                  {
                    header: 'Cross-Origin-Embedder-Policy',
                    value: 'require-corp',
                    override: false,
                  },
                ],
              },
            },
          ),
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

function defaultToIndexHtml(
  scope: Construct,
): FunctionAssociation {
  // prettier-ignore
  const ignoreRegex = `/\.(${getExtensions().join('|')})$/`
  return {
    function: new DefaultToIndexHtmlFunction(
      scope,
      'DefaultToIndexHtmlFunction',
      { ignoreRegex },
    ),
    eventType: FunctionEventType.VIEWER_REQUEST,
  }
}
