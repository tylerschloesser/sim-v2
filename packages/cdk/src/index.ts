import { App } from 'aws-cdk-lib'
import { CdnStack } from './cdn-stack.js'
import { CertificateStack } from './certificate-stack.js'
import { DnsStack } from './dns-stack.js'
import { Domain, Region } from './types.js'

const STACK_ID_PREFIX: string = 'SimV2'
const ACCOUNT_ID: string = '063257577013'
const DOMAIN: Domain = {
  root: 'slg.dev',
  demo: 'sim-v2.slg.dev',
}

const app = new App()

function stackId(...parts: string[]): string {
  return [STACK_ID_PREFIX, ...parts].join('-')
}

function stackProps<
  R extends Region,
  T extends { region: R },
>({ region, ...props }: T) {
  return {
    env: {
      account: ACCOUNT_ID,
      region,
    },
    crossRegionReferences: true,
    domain: DOMAIN,
    ...props,
  }
}

const dnsStack = new DnsStack(
  app,
  stackId('DNS'),
  stackProps({
    region: Region.US_WEST_2,
  }),
)

const certificateStack = new CertificateStack(
  app,
  stackId('Certificate'),
  stackProps({
    region: Region.US_EAST_1,
    demoHostedZone: dnsStack.demoHostedZone,
  }),
)

new CdnStack(
  app,
  stackId('CDN'),
  stackProps({
    region: Region.US_WEST_2,
    certificate: certificateStack.certificate,
    demoHostedZone: dnsStack.demoHostedZone,
  }),
)
