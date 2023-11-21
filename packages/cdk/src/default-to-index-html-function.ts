import {
  Function,
  FunctionCode,
} from 'aws-cdk-lib/aws-cloudfront'
import { Construct } from 'constructs'

export class DefaultToIndexHtmlFunction extends Function {
  constructor(
    scope: Construct,
    id: string,
    {
      ignoreRegex,
    }: {
      ignoreRegex: string
    },
  ) {
    super(scope, id, {
      // prettier-ignore
      code: FunctionCode.fromInline(`
        function handler(event) {
          var request = event.request
          var uri = request.uri
          if (uri.match(${ignoreRegex})) {
            return request
          }
          request.uri = '/'
          return request
        }
      `),
    })
  }
}
