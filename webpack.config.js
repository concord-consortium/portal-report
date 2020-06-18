const path = require('path')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')

// WEBPACK_TARGET=lib webpack will build UMD library.
// Library entry point is defined js/library.js
const lib = process.env.WEBPACK_TARGET === 'lib'

const appEntry = {
  'app': ['./js/index.js'],
  'rubric-test': ['./js/rubric-test.js']
}
const libEntry = {
  'portal-report': ['./js/library.js']
}

module.exports = (env, argv) => {
  const devMode = argv.mode !== 'production';

  const config = {
    entry: lib ? libEntry : appEntry,
    output: {
      path: path.join(__dirname, lib ? 'dist/library' : 'dist'),
      filename: '[name].js',
      library: lib ? 'PortalReport' : undefined,
      libraryTarget: lib ? 'umd' : undefined
    },
    performance: {
      // turn off bundle size warnings
      hints: false
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
    },
    mode: devMode ? 'development' : 'production',
    module: {
      rules: [
        {
          test: /\.[tj]sx?$/,
          exclude: path.join(__dirname, 'node_modules'),
          enforce: 'pre',
          use: [
            {
              loader: 'eslint-loader',
              options: {}
            }
          ]
        },
        {
          test: /\.[tj]sx?$/,
          exclude: path.join(__dirname, 'node_modules'),
          loader: 'ts-loader',
          options: {
            transpileOnly: true // IMPORTANT! use transpileOnly mode to speed-up compilation
          }
        },
        // This code coverage instrumentation should only be added when needed. It makes
        // the code larger and slower
        process.env.CODE_COVERAGE ? {
          test: /\.[tj]sx?$/,
          loader: 'istanbul-instrumenter-loader',
          options: { esModules: true },
          enforce: 'post',
          // I'm not sure but I don't think it is necessary to exclude the cypress and
          // tests folder. I think Jest does its own loading of tests. And cypress does
          // its own loading of cypress
          exclude: path.join(__dirname, 'node_modules'),

        } : {},
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              }
            },
            'postcss-loader'
          ]
        },
        {
          test: /css[\\\/](portal-dashboard|dashboard)[\\\/].*\.less$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[name]--[local]--[hash:base64:8]'
                },
                importLoaders: 1
              }
            },
            'less-loader'
          ]
        },
        {
          test: /css[\\\/](common|report|authoring)[\\\/].*\.less$/,
          loader: 'style-loader!css-loader!less-loader'
        },
        {
          test: /\.(png|jpg|gif)$/,
          // inline base64 URLs for <=8k images, direct URLs for the rest
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192
              }
            }
          ]
        },
        {
          // Support ?123 suffix, e.g. ../fonts/m4d-icons.eot?3179539#iefix in react-responsive-carousel.less
          test: /\.(eot|ttf|woff|woff2)((\?|\#).*)?$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192
              }
            }
          ]
        },
        {
          test: /\.svg$/,
          oneOf: [
            {
              // Do not apply SVGR import in CSS files.
              issuer: /\.(css|less)$/,
              use: 'url-loader'
            },
            {
              issuer: /\.tsx?$/,
              loader: '@svgr/webpack'
            }
          ]
        }
      ]
    },
    devtool: 'source-map',
    plugins: [
      new ForkTsCheckerWebpackPlugin()
    ]
  };

  if (!lib) {
    // We don't need .html page in our library.
    config.plugins.push(new CopyWebpackPlugin([
      {from: 'public'}
    ]))
  }

  if (lib) {
    config.externals = [
      {
        'react': {
          root: 'React',
          commonjs2: 'react',
          commonjs: 'react',
          amd: 'react'
        }
      },
      {
        'react-dom': {
          root: 'ReactDOM',
          commonjs2: 'react-dom',
          commonjs: 'react-dom',
          amd: 'react-dom'
        }
      }
    ];
  }

  return config;
}
