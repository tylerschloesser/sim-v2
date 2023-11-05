import { Environment, StackProps } from 'aws-cdk-lib'

export interface Domain {
  root: string
  demo: string
}

export enum Region {
  US_WEST_2 = 'us-west-2',
  US_EAST_1 = 'us-east-1',
}

export interface CommonStackProps extends StackProps {
  domain: Domain
  env: Omit<Required<Environment>, 'region'> & {
    region: Region
  }
}
