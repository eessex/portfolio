var express = require('express')
var path = require('path')

var middleware = express.Router()

middleware.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../dist/index.html'))
})

module.exports = middleware
