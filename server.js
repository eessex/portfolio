var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var logger = require('morgan')
require('dotenv').load()

var app = express()
let port
let db

if (process.env.NODE_ENV === 'test') {
  port = 5000
  db = 'portfolio_test'
} else {
  port = process.env.PORT || 3000
  db = process.env.MONGODB_URI
  app.use(logger('dev'))
}

mongoose.connect(db)

if (process.env.NODE_ENV === 'production') {
  app.use(function (req, res, next) {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`)
    } else {
      next()
    }
  })
}

app.use(function (req, res, next) {
  next()
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

var publicPath = express.static(path.join(__dirname, '/dist'))

app.use('/dist', publicPath)
app.use('/api', require('./src/api/apps'))
app.use('*', require('./src/client/middleware'))

app.use(function (err, req, res, next) {
  console.error(err)
  next(err)
})

app.listen(port)
console.log('Listening on port ' + port)

module.exports = app
