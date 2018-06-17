const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
require('webpack')

module.exports = {
  entry: ['babel-polyfill', './client/index.js'],
  output: {
    filename: './dist/bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: [path.join(__dirname, 'client')],
        query: {
          plugins: ['transform-runtime'],
          presets: ['env', 'stage-0', 'react']
        }
      },
      {
        test: /\.jsx$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: [path.join(__dirname, 'client')],
        query: {
          plugins: ['transform-runtime'],
          presets: ['env', 'stage-0', 'react']
        }
      },
      {
        test: /\.html$/,
        loader: 'underscore-template-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: './dist/index.html',
      title: 'Eve Essex',
      template: './client/index.html'
    })
  ]
}
