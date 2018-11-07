import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import { matchPath } from 'react-router-dom'
import cookiesMiddleware from 'universal-cookie-express'
import Cookies from 'universal-cookie'

import createStore from 'client/utils/store'
import { fetchSettings } from 'client/actions/settings'
import { routes } from 'client/routes'
import { ServerRender } from 'server/render'
const { MONGODB_URI, MONGODB_TEST_URI, PORT, NODE_ENV } = process.env

const app = express()

let port
let db

if (NODE_ENV === 'test') {
  console.log('starting test server')
  port = 5000
  db = MONGODB_TEST_URI
} else {
  port = PORT || 3000
  db = MONGODB_URI
  app.use(morgan('dev'))
}

if (NODE_ENV === 'production') {
  app.use(function (req, res, next) {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`)
    } else {
      next()
    }
  })
}

mongoose.connect(
  db,
  { useNewUrlParser: true, useCreateIndex: true }
).then(() => {
  console.log('Mongodb connected')
}).catch((err) => {
  console.log('Mongodb error', err)
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookiesMiddleware())

app.use((req, res, next) => {
  next()
})

app.use(cors())
app.use(express.static('public'))
app.use('/api', require('./api'))

app.get('*', async (req, res, next) => {
  const cookies = new Cookies(req.headers.cookie)
  const session = cookies.get('portfolio.session')

  const { store } = createStore({ entry: req.url, session })

  const settings = await store.dispatch(fetchSettings())
  const activeRoute = routes.find(route => matchPath(req.url, route))

  const promiseData = activeRoute && activeRoute.fetchInitialData
    ? activeRoute.fetchInitialData(req.path, store)
    : Promise.resolve()

  promiseData.then(data => {
    const context = { data, settings }
    const content = ServerRender(req, store, context)

    res.send(content)
  }).catch(next)
})

app.listen(port, () => {
  console.log(`Server is listening on port:${port}`)
})
