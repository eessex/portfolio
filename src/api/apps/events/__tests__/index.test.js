import { cloneDeep } from 'lodash'
import request from 'supertest'
import { connectTestDB, disconnectTestDB, testApp } from 'client/tests/dbUtils'
import { UpcomingEvent, PastEvent } from 'client/tests/fixtures/events'
import { events } from '../index'
import Event from '../schema'

const app = testApp.use(events)

describe('/api/events', () => {
  let event
  beforeEach(() => {
    event = cloneDeep(UpcomingEvent)
  })

  afterEach(done => {
    Event.remove({}, err => {
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
      .send(PastEvent)
      .set('Accept', 'application/json')
      .end(err => {
        if (err) { console.warn(err) }

        request(app)
          .post('/')
          .send(event)
          .set('Accept', 'application/json')
          .end(err => {
            if (err) { console.warn(err) }
            done()
          })
      })
  }

  describe('POST / - New event', () => {
    it('can create an event', done => {
      request(app)
        .post('/')
        .send({ title: 'New Event' })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          const { data, message } = res.body

          expect(message).toBe('Event created')
          expect(data.title).toBe('New Event')
          expect(data.slug).toBe('new-event')
          expect(data._id).toBeTruthy()
          done()
        })
    })

    it('silently rejects fields not in schema', done => {
      request(app)
        .post('/')
        .send({ title: 'New Event', extra: true, stuff: 'stuff' })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          const { data, message } = res.body

          expect(message).toBe('Event created')
          expect(data.title).toBe('New Event')
          expect(data.slug).toBe('new-event')
          expect(data._id).toBeTruthy()
          expect(data.extra).toBeFalsy()
          expect(data.stuff).toBeFalsy()
          done()
        })
    })
  })

  describe('GET / - Fetch all events', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('can fetch all events ordered by date', done => {
      request(app)
        .get('/')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }

          expect(res.body.length).toBe(2)
          expect(res.body[0].title).toBe(event.title)
          expect(res.body[1].title).toBe(PastEvent.title)
          done()
        })
    })

    it('Can query for published events only', done => {
      request(app)
        .get('/')
        .query({ published: true })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }

          expect(res.body.length).toBe(1)
          expect(res.body[0].title).toBe(event.title)
          done()
        })
    })
  })

  describe('GET /:id - Fetch single event', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('returns an event by slug', done => {
      request(app)
        .get('/eve-essex')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }

          expect(res.body.title).toBe(PastEvent.title)
          done()
        })
    })

    it('returns an event by _id', done => {
      request(app)
        .get('/5a028e8e41c58900120bc57c')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }

          expect(res.body.title).toBe(PastEvent.title)
          done()
        })
    })

    it('can query for published events', done => {
      request(app)
        .get('/5a028e8e41c58900120bc57c')
        .query({ published: true })
        .set('Accept', 'application/json')
        .expect(404)
        .end((err, res) => {
          if (err) { console.warn(err) }
          expect(res.error.toString()).toMatch('Error: cannot GET')
          done()
        })
    })
  })

  describe('PUT /:id - Update single event', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('Updates an event by slug', done => {
      request(app)
        .put('/eve-essex')
        .send({ title: 'New Title' })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }

          expect(res.body.title).toBe('New Title')
          expect(res.body.slug).toBe('new-title')
          expect(res.body.description).toBe(PastEvent.description)
          done()
        })
    })

    it('Updates an event by _id', done => {
      request(app)
        .put('/5a028e8e41c58900120bc57c')
        .send({ title: 'New Title' })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }

          expect(res.body.title).toBe('New Title')
          expect(res.body.slug).toBe('new-title')
          expect(res.body.description).toBe(PastEvent.description)
          done()
        })
    })
  })

  describe('DELETE /:id - Update single event', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('Updates an event by slug', done => {
      request(app)
        .delete('/eve-essex')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          expect(res.body.message).toBe('Event deleted')
          done()
        })
    })

    it('Updates an event by _id', done => {
      request(app)
        .delete('/5a028e8e41c58900120bc57c')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          expect(res.body.message).toBe('Event deleted')
          done()
        })
    })
  })
})
