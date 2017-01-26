/* eslint-disable camelcase */
const webpack = require('webpack')
const path = require('path')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const ChunkManifestPlugin = require('chunk-manifest-webpack-plugin')

const nodeEnv = process.env.NODE_ENV || 'development'
const svgoConfig = require('./svgo.config')

const stringifyEnvBool = (bool) => {
  if (bool === 'true') return 'true'
  return 'false'
}

const createWebpackConfig = (options = {}) => {
  const clientDir = path.join(__dirname, 'client')
  const destDir = path.join(__dirname, 'priv/static')
  const { name } = options
  if (!name) throw new Error('Please set name in options')
  const loadFonts = options.loadFonts !== false

  const config = {
    context: clientDir,
    output: {
      path: destDir,
      filename: 'js/[name].js',
      chunkFilename: 'js/[id].js',
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          loaders: [
            'style-loader',
            'css-loader',
          ],
        },
        {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          include: [
            clientDir,
            path.dirname(require.resolve('react-dates')),
          ],
        },
        {
          test: require.resolve('trackjs'),
          loader: 'exports-loader?trackJs',
        },
        {
          test: /\.svg$/,
          exclude: [/images/],
          loaders: ['babel-loader', 'react-svg-loader'],
        },
        {
          test: /(\/images\/.*\.svg)|\.(ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2)(\?.*)?$/,
          exclude: [/\/favicon.ico$/],
          loader: 'file-loader',
          options: {
            name: `[path][name]${options.digest ? '-[hash]' : ''}.[ext]`,
            context: path.join(clientDir, 'assets'),
          },
        },
        {
          test: /\.svg$/,
          include: clientDir,
          loader: 'svgo-loader',
          options: svgoConfig,
        },
        {
          test: /\.json$/,
          include: /aws-sdk/,
          loader: 'json-loader',
        },
        {
          test: /\.md$/,
          include: clientDir,
          loaders: [
            {
              loader: 'html-loader',
              options: {
                minimize: true,
              },
            },
            {
              loader: 'markdown-loader',
              options: {
                smartypants: true,
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      modules: [
        clientDir,
        'node_modules',
      ],
      alias: {
        aphrodite$: 'aphrodite/no-important',
        // For some reason, an old, broken version of history is bundled with
        // react-router 4.0.0-alpha.5. This is not true in alpha 6, but alpha 6
        // doesn't work.
        history: path.join(__dirname, 'node_modules/history'),
        'react-dates$': 'react-dates/do-not-import',
        // https://github.com/tajo/react-portal/pull/105
        'react/lib/CSSPropertyOperations$': 'react-dom/lib/CSSPropertyOperations',

        // Force a later version of xmlbuilder for aws-sdk so it doesn't pull in
        // lodash 3
        // https://github.com/aws/aws-sdk-js/pull/1143
        xmlbuilder: path.join(__dirname, 'node_modules/xmlbuilder'),

        // Force lodash and lodash-es to share
        lodash: path.join(__dirname, 'node_modules/lodash'),
        'lodash-es': path.join(__dirname, 'node_modules/lodash'),
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          // NOTE: Any environment variable that is coming from the app's heroku
          // settings MUST be in phoenix_static_buildpack.config's
          // config_vars_to_export
          NODE_ENV: JSON.stringify(nodeEnv),
          HOT: JSON.stringify(!!options.hot),
          TRACKJS_ENABLED: stringifyEnvBool(process.env.TRACKJS_ENABLED),
          TRACKJS_TOKEN: JSON.stringify(process.env.TRACKJS_TOKEN),
          TRACKJS_APPLICATION: JSON.stringify(process.env.TRACKJS_APPLICATION),
          LOAD_FONTS: JSON.stringify(loadFonts),
        },
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: Infinity,
      }),
      // Do not include any of moment's locales.
      // If we don't do this, they are all included and add 23kb min+gzip.
      new webpack.ContextReplacementPlugin(/moment[\\/]locale$/, /^no-locales$/),
      new webpack.NormalModuleReplacementPlugin(
        /react-dates\/src\/svg\/arrow-left.svg$/,
        path.join(clientDir, 'assets/icons/icon-calendar-arrow-left.svg')
      ),
      new webpack.NormalModuleReplacementPlugin(
        /react-dates\/src\/svg\/arrow-right.svg$/,
        path.join(clientDir, 'assets/icons/icon-calendar-arrow-right.svg')
      ),
    ],
    performance: {
      hints: false,
    },
    devServer: {
      contentBase: clientDir,
      noInfo: true,
    },
  }

  if (options.devtool) {
    config.devtool = options.devtool
  }

  if (options.styleguide) {
    delete config.entry
    // config.entry = [
    //   path.join(clientDir, 'app/polyfills'),
    //   path.join(clientDir, 'app/style/base'),
    //   path.join(clientDir, 'styleguide/bootstrap'),
    // ]
    delete config.output
    config.plugins = config.plugins.filter(
      plugin => !(plugin instanceof webpack.optimize.CommonsChunkPlugin))
    config.resolve.alias['rsg-components/Wrapper'] =
      path.join(__dirname, 'client/styleguide/components/StyleGuideWrapper')
  }

  if (options.hot) {
    const publicPath = 'http://localhost:4001/'
    config.entry.app.unshift(
      `webpack-hot-middleware/client?path=${publicPath}__webpack_hmr&reload=true`)
    config.output.devtoolModuleFilenameTemplate = '/[absolute-resource-path]'
    config.output.publicPath = publicPath
    config.plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    )
    config.devServer.hot = true
  }

  if (options.lazy) {
    config.devServer.lazy = true
  }

  if (options.cache) {
    config.plugins.push(new HardSourceWebpackPlugin({
      cacheDirectory: path.join(__dirname, 'tmp/hard-source', name),
      recordsPath: path.join(__dirname, 'tmp/hard-source', name, 'records.json'),
      environmentPaths: {
        root: process.cwd(),
        directories: ['node_modules'],
        files: [
          'package.json',
          'yarn.lock',
          'createWebpackConfig.js',
          'webpack.config.acceptance.js',
          'webpack.config.dev.js',
          'webpack.config.prod.js',
        ],
      },
    }))
  }

  if (options.minimize) {
    // HardSourceWebpackPlugin is not compatbile with CommonsChunkPlugin
    // https://github.com/mzgoddard/hard-source-webpack-plugin/issues/72
    if (options.cache) {
      throw new Error(
        `🚨  We currently cannot cache and minimize at the same time.
See https://github.com/mzgoddard/hard-source-webpack-plugin/issues/72`
      )
    }

    config.plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false,
      }),
      new webpack.optimize.CommonsChunkPlugin({
        async: true,
        children: true,
        minChunks: 3,
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          screw_ie8: true, // React doesn't support IE8
          warnings: false,
        },
        mangle: {
          screw_ie8: true,
        },
        output: {
          comments: false,
          screw_ie8: true,
        },
        sourceMap: true,
      })
    )
  }

  if (options.digest) {
    config.plugins.push(
      new ChunkManifestPlugin({
        filename: 'js/chunk-manifest.json',
        manifestVariable: 'webpackManifest',
      })
    )
  }

  if (process.env.TRACKJS_ENABLED) {
    config.resolve.alias['lib/errorTracker'] = 'lib/trackJsErrorTracker'
  }

  if (options.acceptance) {
    config.output.publicPath = 'http://localhost:4002/'
  }

  if (options.analyze) {
    config.plugins.push(new BundleAnalyzerPlugin())
  }

  return config
}

module.exports = createWebpackConfig
