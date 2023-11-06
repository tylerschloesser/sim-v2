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
          headers['Cross-Origin-Opener-Policy'] = 'same-origin'
          headers['Cross-Origin-Embedder-Policy'] = 'require-corp'

          return response
        }
      `),
    })
  }
}
