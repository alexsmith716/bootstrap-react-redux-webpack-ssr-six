
global.__CLIENT__ = true;
global.__SERVER__ = false;

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const dllHelpers = require('./dllreferenceplugin');
const config = require('../config/config');

const WriteFilePlugin = require('write-file-webpack-plugin');
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const rootPath = path.resolve(__dirname, '..');
const assetsPath = path.resolve(__dirname, '../build/static/dist');

const host = process.env.HOST || 'localhost';
const port = process.env.PORT;
// const port = +process.env.PORT + 1 || 3001;

// ==============================================================================================

var validDLLs = dllHelpers.isValidDLLs('vendor', path.resolve(__dirname, '../build/static'));

if (process.env.WEBPACK_DLLS === '1' && !validDLLs) {
  process.env.WEBPACK_DLLS = '0';
  console.warn('>>>>>> webpack.config.client.development.babel > WEBPACK_DLLS disabled !! <<<<<<<<<<');
} else {
  console.warn('>>>>>> webpack.config.client.development.babel > WEBPACK_DLLS ENABLED !! <<<<<<<<<<');
};

// ==============================================================================================

// https://github.com/bholloway/resolve-url-loader/blob/master/packages/resolve-url-loader/README.md#configure-webpack
// source-maps required for loaders preceding resolve-url-loader (regardless of devtool)

// ==============================================================================================

const webpackConfig = {

  // context: path.resolve(__dirname, '..'),

  name: 'client',
  target: 'web',
  mode: 'development',
  devtool: 'eval', // Each module is executed with eval() and //@ sourceURL
  // devtool: false, // disables default devtool configuration
  // devtool: 'eval-source-map',  // best quality SourceMaps for development
  // devtool: 'source-map',       // A full SourceMap is emitted as a separate file
  // devtool: 'inline-source-map',   // A SourceMap is added as a DataUrl to the bundle

  entry: {
    main: [
      `webpack-hot-middleware/client?path=http://${host}:${port}/__webpack_hmr`,
      path.resolve(__dirname, '../client/assets/scss/bootstrap/bootstrap.global.scss'),
      'bootstrap',
      path.resolve(__dirname, '../client/index.js'),
    ]
  },

  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    path: assetsPath,
    publicPath: `http://${host}:${port}/dist/`
    // publicPath: '/dist/'
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules(\/|\\)(?!(@feathersjs))/,
        // options: babelLoaderQuery
      },
      {
        test: /\.(scss)$/,
        // exclude: /node_modules/,
        use: [
          ExtractCssChunks.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              // localIdentName: '[name]__[local]__[hash:base64:5]',
              getLocalIdent: (loaderContext, localIdentName, localName, options) => {
                const fileName = path.basename(loaderContext.resourcePath)
                if (fileName.indexOf('global.scss') !== -1) {
                  return localName
                } else {
                  const name = fileName.replace(/\.[^/.]+$/, "")
                  return `${name}__${localName}`
                }
              },
              importLoaders: 2,
              sourceMap: true,
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              config: {
                path: 'postcss.config.js'
              }
            }
          },
          {
            loader: 'resolve-url-loader'
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sourceMapContents: true,
              outputStyle: 'expanded',
            }
          },
          {
            loader: 'sass-resources-loader',
            options: {
              resources: [
                path.resolve(rootPath, 'client/assets/scss/app/functions.scss'),
                path.resolve(rootPath, 'client/assets/scss/app/variables.scss'),
                path.resolve(rootPath, 'client/assets/scss/app/mixins.scss')
              ],
            },
          },
        ]
      },
      {
        test: /\.(css)$/,
        use: [
          ExtractCssChunks.loader,
          {
            loader : 'css-loader',
            options: {
              modules: true,
              localIdentName: '[name]__[local]',
              importLoaders: 1,
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              config: {
                path: 'postcss.config.js'
              }
            }
          }
        ]
      },
      {
        test: /\.(jpg|jpeg|gif|png)$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
        },
      },
      {
        test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
          mimetype: 'application/font-woff'
        }
      }, 
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
          mimetype: 'application/octet-stream'
        }
      }, 
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
      }, 
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
          mimetype: 'image/svg+xml'
        }
      },
    ]
  },

  performance: {
    hints: false
  },

  resolve: {
    modules: [ 'client', 'node_modules' ],
    extensions: ['.json', '.js', '.jsx'],
  },

  plugins: [

    new WriteFilePlugin(),

    new webpack.HotModuleReplacementPlugin(),

    new webpack.NoEmitOnErrorsPlugin(),

    new ExtractCssChunks({
      filename: '[name].[contenthash].css',
      // chunkFilename: '[name].[contenthash].chunk.css',
      hot: true,
      orderWarning: true,
      reloadAll: true,
      cssModules: true
    }),

    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify('development') },
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: true,
      __DEVTOOLS__: true
    }),

    // new webpack.NamedModulesPlugin(),

    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: '../../analyzers/bundleAnalyzer/client-development.html',
      // analyzerMode: 'server',
      // analyzerPort: 8888,
      // defaultSizes: 'parsed',
      openAnalyzer: false,
      generateStatsFile: false
    }),

    // This plugin enables more fine grained control of source map generation.
    // https://webpack.js.org/plugins/source-map-dev-tool-plugin/#exclude-vendor-maps
    // https://webpack.js.org/plugins/source-map-dev-tool-plugin/#host-source-maps-externally
    // It is also enabled automatically by certain settings of the devtool configuration option.
    // filename: (string): Defines the output filename of the SourceMap (will be inlined if no value is provided).
    // exclude: (string|regex|array): Exclude modules that match the given value from source map generation.
    // *** exclude source maps for any modules in vendor.js bundle ***
    // new webpack.SourceMapDevToolPlugin({
    //   filename: '[name].js.map',
    //   // exclude: ['vendor.js']
    // }),

    // https://webpack.js.org/plugins/provide-plugin/
    // Use modules without having to use import/require
    // ProvidePlugin: Whenever the identifier is encountered as free variable in a module, 
    //    the module is loaded automatically and the identifier is filled with the exports of 
    //    the loaded module (of property in order to support named exports).

    // To automatically load jquery point variables it exposes to the corresponding node module
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      jquery: 'jquery',
      Popper: ['popper.js', 'default'],
      Alert: "exports-loader?Alert!bootstrap/js/dist/alert",
      Button: "exports-loader?Button!bootstrap/js/dist/button",
      Carousel: "exports-loader?Carousel!bootstrap/js/dist/carousel",
      Collapse: "exports-loader?Collapse!bootstrap/js/dist/collapse",
      Dropdown: "exports-loader?Dropdown!bootstrap/js/dist/dropdown",
      Modal: "exports-loader?Modal!bootstrap/js/dist/modal",
      Popover: "exports-loader?Popover!bootstrap/js/dist/popover",
      Scrollspy: "exports-loader?Scrollspy!bootstrap/js/dist/scrollspy",
      Tab: "exports-loader?Tab!bootstrap/js/dist/tab",
      Tooltip: "exports-loader?Tooltip!bootstrap/js/dist/tooltip",
      Util: "exports-loader?Util!bootstrap/js/dist/util",
    })
  ]
};

// ==============================================================================================

if (process.env.WEBPACK_DLLS === '1' && validDLLs) {
  dllHelpers.installVendorDLL(webpackConfig, 'vendor');
};

module.exports = webpackConfig;
