var path = require('path')
var webpack = require('webpack')
var nodeExternals = require('webpack-node-externals')
var Dotenv = require('dotenv-webpack')

var browserConfig = {
  entry: ["@babel/polyfill", './src/client/index.js'],
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
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      __isBrowser__: 'true'
    }),
    new Dotenv({
      path: path.resolve(__dirname, './.env'),
      systemvars: true
    }),
    new webpack.DefinePlugin({
      'process.env.API_URL': JSON.stringify(process.env.API_URL),
      'process.env.PROCESS_ENV': JSON.stringify(process.env.PROCESS_ENV),
      'process.env.GOOGLE_ANALYTICS_ID': JSON.stringify(process.env.GOOGLE_ANALYTICS_ID)
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
  entry: ["@babel/polyfill", './src/index.js'],
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
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      __isBrowser__: 'false'
    }),
    new Dotenv({
      path: path.resolve(__dirname, './.env'),
      systemvars: true
    }),
    new webpack.DefinePlugin({
      'process.env.API_URL': JSON.stringify(process.env.API_URL),
      'process.env.PROCESS_ENV': JSON.stringify(process.env.PROCESS_ENV),
      'process.env.GOOGLE_ANALYTICS_ID': JSON.stringify(process.env.GOOGLE_ANALYTICS_ID)
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
