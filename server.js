var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var logger = require('morgan');
var config = require('config');

var app = express();

mongoose.connect('mongodb://localhost/' + config.DBHost);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

if(config.util.getEnv('NODE_ENV') !== 'test') {
  app.use(logger('dev')); //TODO- combined for prod
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;
var router = express.Router();

router.get('/', function(req, res) {
  res.json({ message: "Portfolio app" });
});

app.use('/api', require('./api/apps'));
app.use('/', router);

app.listen(port);
console.log('Listening on port ' + port);

module.exports = app