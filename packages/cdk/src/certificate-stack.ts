import { Environment, Stack } from 'aws-cdk-lib'
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager'
import { HostedZone } from 'aws-cdk-lib/aws-route53'
import { Construct } from 'constructs'
import { CommonStackProps, Region } from './types.js'

export interface CertificateStackProps
  extends CommonStackProps {
  demoHostedZone: HostedZone
  env: Omit<Required<Environment>, 'region'> & {
    region: Region.US_EAST_1
  }
}

export class CertificateStack extends Stack {
  public readonly certificate: Certificate
  constructor(
    scope: Construct,
    id: string,
    {
      domain,
      demoHostedZone,
      ...props
    }: CertificateStackProps,
  ) {
    super(scope, id, props)

    this.certificate = new Certificate(
      this,
      'Certificate',
      {
        domainName: domain.demo,
        validation:
          CertificateValidation.fromDns(demoHostedZone),
      },
    )
  }
}
