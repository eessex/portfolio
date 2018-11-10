const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
var Dotenv = require('dotenv-webpack')
const webpack = require('webpack')

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
      title: 'Eve Essex',
      template: './src/client/index.html'
    }),
    new Dotenv({
      path: path.resolve(__dirname, './.env'),
      systemvars: true
    }),
    new webpack.DefinePlugin({
      'process.env.API_URL': JSON.stringify(process.env.API_URL),
      'process.env.PROCESS_ENV': JSON.stringify(process.env.PROCESS_ENV)
    })
  ]
}
