import { cloneDeep } from 'lodash'
import request from 'supertest'
import { connectTestDB, disconnectTestDB, testApp } from 'client/tests/dbUtils'
import { Settings as SettingsFixture } from 'client/tests/fixtures/settings'
import settings from '../index'
import Settings from '../schema'

const app = testApp.use(settings)

describe('/api/settings', () => {
  let setting
  beforeEach(() => {
    setting = cloneDeep(SettingsFixture)
  })

  afterEach(done => {
    Settings.remove({}, err => {
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
      .send(setting)
      .set('Accept', 'application/json')
      .end(err => {
        if (err) { console.warn(err) }
        done()
      })
  }

  describe('POST / - New settings', () => {
    it('can create settings', done => {
      request(app)
        .post('/')
        .send({ title: 'New Settings' })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          const { settings, message } = res.body
          expect(message).toBe('Settings created')
          expect(settings.title).toBe('New Settings')
          expect(settings.nav).toEqual([ 'events', 'releases', 'projects', 'info' ])
          expect(settings._id).toBeTruthy()
          done()
        })
    })

    it('silently rejects fields not in schema', done => {
      request(app)
        .post('/')
        .send({ title: 'New Settings', extra: true, stuff: 'stuff' })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          const { settings, message } = res.body
          expect(message).toBe('Settings created')
          expect(settings.title).toBe('New Settings')
          expect(settings._id).toBeTruthy()
          expect(settings.extra).toBeFalsy()
          expect(settings.stuff).toBeFalsy()
          done()
        })
    })
  })

  describe('GET / - Fetch all settings', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('can fetch settings', done => {
      request(app)
        .get('/')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          const { title } = res.body
          expect(title).toBe(SettingsFixture.title)
          done()
        })
    })
  })

  describe('PUT /:id - Update settings', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('Updates settings by _id', done => {
      request(app)
        .put('/5999f935bc41cbb936d7ec7a')
        .send({ title: 'New Title' })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          const { settings, message } = res.body
          expect(message).toBe('Settings updated')
          expect(settings.title).toBe('New Title')
          expect(settings.meta.description).toBe(SettingsFixture.meta.description)
          done()
        })
    })
  })
})
