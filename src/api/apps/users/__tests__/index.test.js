import request from 'supertest'
import mongoose from 'mongoose'
import express from 'express'
import users from '../index'
import User from '../schema'
import bodyParser from 'body-parser'
const { MONGODB_TEST_URI } = process.env

const app = express()
app.use(bodyParser.json())

describe('/users', () => {
  let user
  beforeEach(() => {
    user = {
      name_first: 'Dolly',
      name_last: 'Parton',
      email: 'user@email.com',
      password: 'asdf123'
    }
  })

  afterEach(done => {
    User.remove({}, (err) => {
      if (err) {
        console.error(err.status)
      }
      done()
    })
  })

  beforeAll(() => {
    mongoose.connect(MONGODB_TEST_URI)
  })
  afterAll(done => {
    mongoose.disconnect(done)
  })

  describe('/api/user', () => {
    it('can save a user', done => {
      request(app.use(users))
        .post('/')
        .send(user)
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          const data = JSON.parse(res.text)
          expect(data.message).toBe('User created')
          done()
        })
    })
  })
})
