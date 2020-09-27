import request from 'supertest'
import { connectTestDB, disconnectTestDB, testApp } from 'client/tests/dbUtils'
import { users } from '../index'
import User from '../schema'

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('sessionstring')
}))

const app = testApp.use(users)

describe('/api/users', () => {
  let user
  beforeEach(() => {
    user = {
      name_first: 'Dolly',
      name_last: 'Parton',
      email: 'user@email.com',
      password: 'asdf123',
      _id: '5a0a60d48dcb886c6a1ab1df'
    }
  })

  afterEach(done => {
    User.deleteOne({}, err => {
      if (err) {
        console.error(err.status)
      }
      done()
    })
  })

  beforeAll(done => {
    connectTestDB(done)
  })

  afterAll(done => {
    disconnectTestDB(done)
  })

  const seedData = done => {
    request(app)
      .post('/')
      .send(user)
      .set('Accept', 'application/json')
      .end(err => {
        if (err) { console.warn(err) }
        done()
      })
  }

  describe('POST / - New user', () => {
    it('can create a user', done => {
      request(app)
        .post('/')
        .send(user)
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          const { currentUser, message, session } = res.body

          expect(message).toBe('User created')
          expect(currentUser._id).toBeTruthy()
          expect(currentUser.email).toBe(user.email)
          expect(session).toBeTruthy()
          done()
        })
    })
  })

  describe('POST / - New user', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('requires a unique email', done => {
      delete user._id
      request(app)
        .post('/')
        .send(user)
        .set('Accept', 'application/json')
        .expect(400)
        .end((err, res) => {
          if (err) { console.warn(err) }
          const { message } = res.body
          expect(message).toMatch('duplicate key error')
          expect(message).toMatch('user@email.com')
          done()
        })
    })
  })

  describe('PUT /:id - Update single publication', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('Updates a user', done => {
      request(app)
        .put('/5a0a60d48dcb886c6a1ab1df')
        .send({ title: 'New Title' })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          const { message } = res.body
          expect(message).toBe('User updated')
          done()
        })
    })
  })

  describe('DELETE /:id - Update single user', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('Updates a user by slug', done => {
      request(app)
        .delete('/5a0a60d48dcb886c6a1ab1df')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          const { message } = res.body
          expect(message).toBe('User deleted')
          done()
        })
    })
  })
})
