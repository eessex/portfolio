const path = require('path')
const webpack = require('webpack')
const htmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const htmlWebpackPluginConfig = new htmlWebpackPlugin({
  template: './client/index.html',
  filename: 'index.html',
  inject: 'body'
})

export default {
  devtool: 'source-map',

  entry: [
    './client/index'
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/dist/'
  },

  plugins: [
    htmlWebpackPluginConfig,
    new ExtractTextPlugin('style.css')
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ],

  module: {
    loaders: [
      { test: /\.js?$/,
        loader: 'babel',
        exclude: /node_modules/ },
      { test: /\.scss?$/,
        loader: 'style!css!sass',
        include: path.join(__dirname, 'src', 'styles') },
      { test: /\.png$/,
        loader: 'file' },
      { test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file'}
    ]
  }
}

// const path = require('path')
// const htmlWebpackPlugin = require('html-webpack-plugin')
// const ExtractTextPlugin = require('extract-text-webpack-plugin')

// const htmlWebpackPluginConfig = new htmlWebpackPlugin({
//   template: './client/index.html',
//   filename: 'index.html',
//   inject: 'body'
// })

// module.exports = {
//   entry: './client/index.js',
//   output: {
//     path: path.resolve('dist'),
//     filename: 'bundle.js'
//   },
//   module: {
//     loaders: [
//       {
//         test: /\.js$/,
//         loader: 'babel-loader',
//         exclude: /node_modules/,
//         include: [path.join(__dirname, 'client')]
//       },
//       {
//         test: /\.jsx$/,
//         loader: 'babel-loader',
//         exclude: /node_modules/,
//         include: [path.join(__dirname, 'client')]
//       },
//       {
//         test: /\.scss$/,
//         loader: ExtractTextPlugin.extract({
//           use: ['css-loader', 'sass-loader'],
//           fallback: 'style-loader'
//         })
//       }
//     ]
//   },
//   plugins: [
//     htmlWebpackPluginConfig,
//     new ExtractTextPlugin('style.css')
//   ]
// };
