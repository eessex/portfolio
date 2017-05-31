var express = require('express');
var path = require('path');
var middleware = express.Router();

middleware.use(function(req, res, next) {
  console.log('HIT THE CLIENT ROUTER')
  next();
});

middleware.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../client/index.html'))
});

module.exports = middleware;