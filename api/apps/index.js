var express = require('express');
var apiV1 = express.Router();

apiV1.use('/events', require('./events'));
apiV1.use('/pages', require('./pages'));
apiV1.use('/users', require('./users'));

module.exports = apiV1;
