var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var logger = require('morgan');

var app = express();
mongoose.connect('mongodb://localhost/portforlio');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(logger('dev'));

var port = process.env.PORT || 3000;
var router = express.Router();

router.get('/', function(req, res) {
  res.json({ message: "Portfolio app" });
});

app.use('/api', require('./api/apps'));
app.use('/', router);

app.listen(port);
console.log('Listening on port ' + port);