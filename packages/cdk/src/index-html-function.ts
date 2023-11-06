import {
  Function,
  FunctionCode,
} from 'aws-cdk-lib/aws-cloudfront'
import { Construct } from 'constructs'
import { getExtensions } from './webpack-manifest.js'

// If the request doesn't match a list of extensions we
// get from the webpack manifest, assume it's a client
// side route and return the index.html
//
export class IndexHtmlFunction extends Function {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      // prettier-ignore
      code: FunctionCode.fromInline(`
        function handler(event) {
          var request = event.request
          var uri = request.uri
          if (uri.match(/\.(${getExtensions().join('|')})$/)) {
            return request
          }
          request.uri = '/'

          var response = event.response
          response.headers = response.headers || {}
          response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
          response.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'

          return request
        }
      `),
    })
  }
}
