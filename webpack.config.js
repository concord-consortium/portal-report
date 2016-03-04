var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: [
    './js/index.js'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'app.js'
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
        loader: 'style!css!autoprefixer'
      },
      {
        test: /\.less$/,
        loader: 'style!css!less!autoprefixer'
      },
      {
        test: /\.(png|jpg|gif)$/,
        // inline base64 URLs for <=8k images, direct URLs for the rest
        loader: 'url-loader?limit=8192'
      },
      {
        test: /\.(eot|ttf|woff|svg)$/,
        loader: 'url-loader?limit=1'
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {from: 'public'},
      // Fonts used by react-responsive-carousel
      {from: 'node_modules/react-responsive-carousel/styles/font', to: 'styles/font'}
    ])
  ]
};