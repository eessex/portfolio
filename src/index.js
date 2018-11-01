import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import { matchPath } from 'react-router-dom'
import createStore from 'client/utils/store'
import routes from 'client/routes2.js'
import { ServerRender } from 'server/render'
const { MONGODB_URI, PORT } = process.env

mongoose.connect(
  MONGODB_URI,
  { useNewUrlParser: true, useCreateIndex: true }
).then(() => {
  console.log('Mongodb connected')
}).catch((err) => {
  console.log('Mongodb error', err)
})

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use((req, res, next) => {
  next()
})

app.use(cors())
app.use(express.static('public'))
app.use('/api', require('./api'))

app.get('*', (req, res, next) => {
  const { store } = createStore(req.url)
  const activeRoute = routes.find(route => matchPath(req.url, route))

  const promise = activeRoute && activeRoute.fetchInitialData
    ? activeRoute.fetchInitialData(req.path, store)
    : Promise.resolve()

  promise.then(data => {
    const context = { data }
    const content = ServerRender(req.url, store, context)

    res.send(content)
  }).catch(next)
})

app.listen(PORT, () => {
  console.log(`Server is listening on port:${PORT}`)
})
