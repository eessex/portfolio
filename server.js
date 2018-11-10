var cors = require('cors')
var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var logger = require('morgan')
require('dotenv').load()

var { MONGODB_URI, MONGODB_TEST_URI, NODE_ENV, PORT } = process.env

var app = express()
let port
let db

if (NODE_ENV === 'test') {
  console.log('starting test server')
  port = 5000
  db = MONGODB_TEST_URI
} else {
  port = PORT || 3000
  db = MONGODB_URI
  app.use(logger('dev'))
}

mongoose.connect(db)

if (NODE_ENV === 'production') {
  app.use(function (req, res, next) {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`)
    } else {
      next()
    }
  })
}
app.use(cors())

app.use(function (req, res, next) {
  next()
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

var publicPath = express.static(path.join(__dirname, '/dist'))

app.use('/dist', publicPath)
app.use('/api', require('./src/api'))
app.use('*', require('./src/client/middleware'))

app.use(function (err, req, res, next) {
  console.error(err)
  next(err)
})

app.listen(port)
console.log('Listening on port ' + port)

module.exports = app
