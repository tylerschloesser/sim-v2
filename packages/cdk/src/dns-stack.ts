import { Stack } from 'aws-cdk-lib'
import {
  HostedZone,
  PublicHostedZone,
  RecordSet,
  RecordTarget,
  RecordType,
} from 'aws-cdk-lib/aws-route53'
import { Construct } from 'constructs'
import invariant from 'tiny-invariant'
import { CommonStackProps } from './types.js'

export class DnsStack extends Stack {
  public readonly demoHostedZone: HostedZone

  constructor(
    scope: Construct,
    id: string,
    { domain, ...props }: CommonStackProps,
  ) {
    super(scope, id, props)

    const rootHostedZone = PublicHostedZone.fromLookup(
      this,
      'HostedZone-Root',
      {
        domainName: domain.root,
      },
    )

    this.demoHostedZone = new PublicHostedZone(
      this,
      'HostedZone-Demo',
      {
        zoneName: domain.demo,
      },
    )

    invariant(this.demoHostedZone.hostedZoneNameServers)
    new RecordSet(this, 'DnsRecord-NS-Demo', {
      recordType: RecordType.NS,
      recordName: this.demoHostedZone.zoneName,
      target: RecordTarget.fromValues(
        ...this.demoHostedZone.hostedZoneNameServers,
      ),
      zone: rootHostedZone,
    })
  }
}
