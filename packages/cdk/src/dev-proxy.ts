import { App, Stack, StackProps } from 'aws-cdk-lib'
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager'
import {
  Distribution,
  OriginProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront'
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins'
import {
  ARecord,
  HostedZone,
  PublicHostedZone,
  RecordSet,
  RecordTarget,
  RecordType,
} from 'aws-cdk-lib/aws-route53'
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets'
import { Construct } from 'constructs'
import invariant from 'tiny-invariant'
import { Region } from './types.js'

const STACK_ID_PREFIX: string = 'SimV2DevProxy'
const ACCOUNT_ID: string = '063257577013'

const ROOT_DOMAIN_NAME: string = 'slg.dev'
const SOURCE_DOMAIN_NAME: string = 'dev-proxy.slg.dev'
const TARGET_DOMAIN_NAME: string =
  'ec2-34-218-222-50.us-west-2.compute.amazonaws.com'

function stackId(...parts: string[]): string {
  return [STACK_ID_PREFIX, ...parts].join('-')
}

class DnsStack extends Stack {
  public readonly hostedZone: HostedZone

  constructor(
    scope: Construct,
    id: string,
    props: StackProps,
  ) {
    super(scope, id, props)

    const rootHostedZone = PublicHostedZone.fromLookup(
      this,
      'HostedZone-Root',
      {
        domainName: ROOT_DOMAIN_NAME,
      },
    )

    this.hostedZone = new PublicHostedZone(
      this,
      'HostedZone-Demo',
      {
        zoneName: SOURCE_DOMAIN_NAME,
      },
    )

    invariant(this.hostedZone.hostedZoneNameServers)
    new RecordSet(this, 'DnsRecord-NS-Demo', {
      recordType: RecordType.NS,
      recordName: this.hostedZone.zoneName,
      target: RecordTarget.fromValues(
        ...this.hostedZone.hostedZoneNameServers,
      ),
      zone: rootHostedZone,
    })
  }
}

class CertificateStack extends Stack {
  public readonly certificate: Certificate
  constructor(
    scope: Construct,
    id: string,
    {
      hostedZone,
      ...props
    }: StackProps & { hostedZone: HostedZone },
  ) {
    super(scope, id, props)

    invariant(props.env?.region === Region.US_EAST_1)

    this.certificate = new Certificate(
      this,
      'Certificate',
      {
        domainName: SOURCE_DOMAIN_NAME,
        validation:
          CertificateValidation.fromDns(hostedZone),
      },
    )
  }
}

class ProxyStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    {
      certificate,
      hostedZone,
      ...props
    }: StackProps & {
      certificate: Certificate
      hostedZone: HostedZone
    },
  ) {
    super(scope, id, props)

    const distribution = new Distribution(
      this,
      'Distribution',
      {
        defaultBehavior: {
          origin: new HttpOrigin(TARGET_DOMAIN_NAME, {
            protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
            httpPort: 8080,
          }),
        },
        domainNames: [SOURCE_DOMAIN_NAME],
        certificate,
      },
    )

    new ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      target: RecordTarget.fromAlias(
        new CloudFrontTarget(distribution),
      ),
    })
  }
}

const app = new App()

const dnsStack = new DnsStack(app, stackId('DNS'), {
  env: {
    account: ACCOUNT_ID,
    region: Region.US_WEST_2,
  },
  crossRegionReferences: true,
})

const certificateStack = new CertificateStack(
  app,
  stackId('Certificate'),
  {
    env: {
      account: ACCOUNT_ID,
      region: Region.US_EAST_1,
    },
    crossRegionReferences: true,
    hostedZone: dnsStack.hostedZone,
  },
)

new ProxyStack(app, stackId('Proxy'), {
  env: {
    account: ACCOUNT_ID,
    region: Region.US_WEST_2,
  },
  crossRegionReferences: true,
  certificate: certificateStack.certificate,
  hostedZone: dnsStack.hostedZone,
})
