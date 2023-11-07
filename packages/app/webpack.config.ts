import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import * as childProcess from 'node:child_process'
import { promisify } from 'node:util'
import invariant from 'tiny-invariant'
import webpack from 'webpack'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import 'webpack-dev-server'
import { WebpackManifestPlugin } from 'webpack-manifest-plugin'

const exec = promisify(childProcess.exec)

const { DefinePlugin } = webpack

interface WebpackEnv {
  analyze?: boolean
  WEBPACK_SERVE?: true
}

interface WebpackArgv {
  mode: webpack.Configuration['mode']
}

export default async (
  env: WebpackEnv,
  argv: WebpackArgv,
) => {
  const prod = argv.mode !== 'development'
  const mode = prod ? 'production' : 'development'

  invariant(!env.analyze || mode === 'production')

  const config: webpack.Configuration = {
    stats: 'minimal',
    mode,
    entry: './src/index.ts',
    devtool: prod ? 'source-map' : 'eval-source-map',
    output: {
      filename: '[name].[contenthash].js',
      chunkFilename: '[name].[contenthash].chunk.js',
      clean: true,
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            prod
              ? MiniCssExtractPlugin.loader
              : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: true,
                  localIdentName:
                    '[local]--[hash:base64:5]',
                },
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [['postcss-preset-env']],
                },
              },
            },
            'sass-loader',
          ],
        },
        {
          test: /\.glsl$/,
          type: 'asset/source',
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      extensionAlias: {
        '.js': ['.ts', '.tsx', '.js'],
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: prod
          ? 'index.[contenthash].html'
          : 'index.html',
        template: './src/index.html',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'app.webmanifest',
          },
        ],
      }),
      prod && new MiniCssExtractPlugin(),
      prod && new WebpackManifestPlugin({}),
      env.analyze && new BundleAnalyzerPlugin(),
      new DefinePlugin({
        __APP_VERSION__: JSON.stringify(
          await getAppVersion(env),
        ),
      }),
    ],
    devServer: {
      hot: false,
      watchFiles: ['./src/index.html'],
      historyApiFallback: true,
      allowedHosts: ['.amazonaws.com', '.slg.dev'],
      client: {
        webSocketURL: 'auto://0.0.0.0:0/ws',
      },
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
    optimization: {
      //
      // disable module concatenation when analyzing
      // https://github.com/webpack-contrib/webpack-bundle-analyzer/issues/466
      //
      concatenateModules:
        !env.analyze && mode === 'production',
    },
  }
  return config
}

async function getAppVersion(
  env: WebpackEnv,
): Promise<string> {
  if (env.WEBPACK_SERVE) {
    return 'dev-server'
  }
  return (
    await Promise.all([getCommitDate(), getCommitHash()])
  ).join('.')
}

async function getCommitDate(): Promise<string> {
  const { stdout, stderr } = await exec(
    'git log -1 --format="%aI"',
  )
  invariant(!stderr)
  return stdout
}

async function getCommitHash(): Promise<string> {
  const { stdout, stderr } = await exec(
    'git rev-parse --short HEAD',
  )
  invariant(!stderr)
  return stdout
}
