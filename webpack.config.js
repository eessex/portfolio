var path = require('path')
var webpack = require('webpack')
var nodeExternals = require('webpack-node-externals')
var Dotenv = require('dotenv-webpack')
var NODE_ENV = process.env.NODE_ENV

var browserConfig = {
  entry: ['babel-polyfill', './src/client/index.js'],
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /(\.(js|jsx)?$)/,
        include: path.resolve('./src'),
        loader: 'babel-loader',
        query: {
          plugins: ['transform-runtime']
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      __isBrowser__: 'true'
    }),
    new Dotenv({
      path: './.env'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': `${NODE_ENV}`
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      path.resolve('./src'),
      path.resolve('./node_modules')
    ],
    alias: {
      'styled-components': path.resolve('./node_modules/styled-components')
    }
  }
}

var serverConfig = {
  entry: ['babel-polyfill', './src/index.js'],
  target: 'node',
  externals: [nodeExternals(), 'react-helmet'],
  output: {
    path: __dirname,
    filename: 'server.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /(\.(js|jsx)?$)/,
        include: path.resolve('./src'),
        loader: 'babel-loader',
        query: {
          plugins: ['transform-runtime']
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      __isBrowser__: 'false'
    }),
    new Dotenv({
      path: './.env'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': `${NODE_ENV}`
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      path.resolve('./src'),
      path.resolve('./node_modules')
    ],
    alias: {
      'styled-components': path.resolve('./node_modules/styled-components')
    }
  }
}

module.exports = [browserConfig, serverConfig]
