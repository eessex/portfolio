const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
require('webpack')

module.exports = {
  entry: ['babel-polyfill', './src/client/index.js'],
  output: {
    filename: './dist/bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: [path.join(__dirname, 'src')],
        query: {
          plugins: ['transform-runtime'],
          presets: ['env', 'stage-0', 'react']
        }
      },
      {
        test: /\.jsx$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: [path.join(__dirname, 'src')],
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
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      path.resolve('./src'),
      path.resolve('./node_modules')
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: './dist/index.html',
      title: process.env.PAGE_TITLE,
      template: './src/client/index.html'
    })
  ]
}
