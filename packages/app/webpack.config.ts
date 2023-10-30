import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import invariant from 'tiny-invariant'
import { Configuration } from 'webpack'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import 'webpack-dev-server'
import { WebpackManifestPlugin } from 'webpack-manifest-plugin'

export default (
  env: {
    analyze?: boolean
  },
  argv: { mode: Configuration['mode'] },
) => {
  const prod = argv.mode !== 'development'
  const mode = prod ? 'production' : 'development'

  invariant(!env.analyze || mode === 'production')

  const config: Configuration = {
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
      new MiniCssExtractPlugin(),
      new WebpackManifestPlugin({}),
      env.analyze && new BundleAnalyzerPlugin(),
    ],
    devServer: {
      hot: false,
      watchFiles: ['./src/index.html'],
      historyApiFallback: true,
      allowedHosts: ['.amazonaws.com'],
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
