import mongoose from 'mongoose'
import express from 'express'
import bodyParser from 'body-parser'

mongoose.Promise = global.Promise
const { MONGODB_TEST_URI } = process.env

export const testApp = express()
testApp.use(bodyParser.json())

export const connectTestDB = done => {
  mongoose.connect(
    MONGODB_TEST_URI,
    {
      keepAlive: true,
      reconnectTries: Number.MAX_VALUE,
      useMongoClient: true
    }
  ).then(() => {
    console.log('Mongodb connected')
    done()
  }).catch((err) => {
    console.warn('Mongodb error', err)
    done()
  })
}

export const disconnectTestDB = done => {
  mongoose.disconnect(done)
}
