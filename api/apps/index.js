var express = require('express')
var apiV1 = express.Router()

apiV1.use('/events', require('./events'))
apiV1.use('/pages', require('./pages'))
apiV1.use('/projects', require('./projects'))
apiV1.use('/publications', require('./publications'))
apiV1.use('/settings', require('./settings'))
apiV1.use('/upload', require('./upload'))
apiV1.use('/users', require('./users'))

module.exports = apiV1
