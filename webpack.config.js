const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  entry: './client/index.js',
  output: {
    filename: './dist/bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: [path.join(__dirname, 'client')]
      },
      {
        test: /\.jsx$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: [path.join(__dirname, 'client')]
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          use: ['css-loader', 'sass-loader'],
          fallback: 'style-loader'
        })
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          use: ['css-loader'],
          fallback: 'style-loader'
        })
      },
      {
        test: /\.html$/,
        loader: 'underscore-template-loader'
      }
    ]
  },
  plugins: [
    new htmlWebpackPlugin({
      filename: './dist/index.html',
      title: 'Eve Essex',
      template: './client/index.html'
    }),
    new ExtractTextPlugin('./dist/style.css')
  ]
}
