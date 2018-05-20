var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var logger = require('morgan')
require('dotenv').load()

var app = express()

if (process.env.NODE_ENV === 'test') {
  var port = 5000
  var db = 'portfolio_test'
  console.log('starting tests')
} else {
  var port = process.env.PORT || 3000
  var db = process.env.MONGODB_URI
  app.use(logger('dev'))
}

mongoose.connect(db, { useMongoClient: true })

if (process.env.NODE_ENV === 'production') {
  app.use(function(req, res, next) {
    if (req.header('x-forwarded-proto') !== 'https')
      res.redirect(`https://${req.header('host')}${req.url}`)
    else
      next()
  })
}


app.use(function(req, res, next) {
  next()
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

var publicPath = express.static(path.join(__dirname, '/dist'))

app.use('/dist', publicPath)
app.use('/api', require('./api/apps'))
app.use('*', require('./client/middleware'))

app.use(function(err, req, res, next) {
  console.error(err)
  next(err)
})

app.listen(port)
console.log('Listening on port ' + port)

module.exports = app
