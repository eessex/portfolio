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
        test: /(\.(ts|tsx|jsx|js)?$)/,
        loader: 'babel-loader',
        exclude: /node_modules/,
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
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    modules: [
      path.resolve('./src'),
      path.resolve('./node_modules')
    ]
  }
}

var serverConfig = {
  entry: ['babel-polyfill', './src/index.ts'],
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
        include: path.resolve('./src'),
        test: /(\.(ts|tsx|jsx|js)?$)/,
        exclude: /node_modules/,
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
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    modules: [
      path.resolve('./src'),
      path.resolve('./node_modules')
    ],
  }
}

module.exports = [browserConfig, serverConfig]
