var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

// WEBPACK_TARGET=lib webpack will build UMD library.
// Library entry point is defined js/library.js
var lib = process.env.WEBPACK_TARGET === 'lib';

var appEntry = {
  'app': ['./js/index.js'],
  'rubric-test': ['./js/rubric-test.js']
}
var libEntry = {
  'portal-report': ['./js/library.js']
}

module.exports = {
  entry: lib ? libEntry : appEntry,
  output: {
    path: path.join(__dirname, lib ? 'dist/library' : 'dist'),
    filename: '[name].js',
    library: lib ? 'PortalReport' : undefined,
    libraryTarget: lib ? 'umd' : undefined
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader?importLoaders=1',
          'postcss-loader'
        ]
      },
      {
        test: /\.less$/,
        loader: 'style!css!less!'
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      },
      {
        test: /\.(png|jpg|gif)$/,
        // inline base64 URLs for <=8k images, direct URLs for the rest
        loader: 'url-loader?limit=8192'
      },
      {
        // Support ?123 suffix, e.g. ../fonts/m4d-icons.eot?3179539#iefix in react-responsive-carousel.less
        test: /\.(eot|ttf|woff|woff2|svg)((\?|\#).*)?$/,
        loader: 'url-loader?limit=8192'
      }
    ]
  },
  devtool: "source-map",
  plugins: []
};

if (!lib) {
  // We don't need .html page in our library.
  module.exports.plugins.push(new CopyWebpackPlugin([
    {from: 'public'}
  ]));
}

if (lib) {
  module.exports.externals = [
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
  ]
}
