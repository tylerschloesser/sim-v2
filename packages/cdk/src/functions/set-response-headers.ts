import {
  Function,
  FunctionCode,
} from 'aws-cdk-lib/aws-cloudfront'
import { Construct } from 'constructs'

export class SetResponseHeadersFunction extends Function {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      // prettier-ignore
      code: FunctionCode.fromInline(`
        function handler(event) {
          var request = event.request
          var response = event.response
          if (request.uri !== '/') {
            return response
          }

          var headers = response.headers
          headers['cross-origin-opener-policy'] = { value: 'same-origin' }
          headers['cross-origin-embedder-policy'] = { value: 'require-corp' }

          return response
        }
      `),
    })
  }
}
