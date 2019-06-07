import express from 'express'

export const apiV1 = express.Router()

apiV1.use('/events', require('./apps/events').events)
apiV1.use('/pages', require('./apps/pages').pages)
apiV1.use('/projects', require('./apps/projects').projects)
apiV1.use('/publications', require('./apps/publications').publications)
apiV1.use('/settings', require('./apps/settings').settings)
apiV1.use('/upload', require('./apps/upload').upload)
apiV1.use('/users', require('./apps/users').users)
