var express = require('express')
var apiV1 = express.Router()

apiV1.use('/events', require('./apps/events'))
apiV1.use('/pages', require('./apps/pages'))
apiV1.use('/projects', require('./apps/projects'))
apiV1.use('/publications', require('./apps/publications'))
apiV1.use('/settings', require('./apps/settings'))
apiV1.use('/upload', require('./apps/upload'))
apiV1.use('/users', require('./apps/users'))

module.exports = apiV1
