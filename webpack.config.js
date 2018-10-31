var path = require('path')
var webpack = require('webpack')
var nodeExternals = require('webpack-node-externals')
var Dotenv = require('dotenv-webpack')

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
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      __isBrowser__: 'true'
    }),
    new Dotenv({
      path: './.env'
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
  externals: [nodeExternals()],
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
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      __isBrowser__: 'false'
    }),
    new Dotenv({
      path: './.env'
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
