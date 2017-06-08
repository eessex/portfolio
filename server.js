var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var logger = require('morgan');
require('dotenv').load();

var app = express();

mongoose.connect('mongodb://localhost/' + process.env.MONGO_DB);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

if (process.env.NODE_ENV === 'test') {
  var port = 5000;
} else {
  var port = process.env.PORT || 3000;
  app.use(logger('dev')); //TODO- combined for prod
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var publicPath = express.static(path.join(__dirname, '/dist'));

app.use('/dist', publicPath);
app.use('/api', require('./api/apps'));
app.use('*', require('./client/middleware'));

app.listen(port);
console.log('Listening on port ' + port);

module.exports = app