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

const db = NODE_ENV === 'test' ? MONGODB_TEST_URI : MONGODB_URI

mongoose.connect(
  db,
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

app.listen(PORT, () => {
  console.log(`Server is listening on port:${PORT}`)
})
