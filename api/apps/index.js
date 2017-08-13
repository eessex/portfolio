var express = require('express');
var apiV1 = express.Router();

console.log('HIT THE API')
apiV1.use('/events', require('./events'));
apiV1.use('/pages', require('./pages'));
apiV1.use('/users', require('./users'));
apiV1.use('/settings', require('./settings'));

module.exports = apiV1;
