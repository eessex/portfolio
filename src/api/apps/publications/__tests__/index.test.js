import { cloneDeep } from 'lodash'
import request from 'supertest'
import { connectTestDB, disconnectTestDB, testApp } from 'client/tests/dbUtils'
import { PublishedRelease, UnpublishedRelease } from 'client/tests/fixtures/publications'
import publications from '../index'
import Publication from '../schema'

const app = testApp.use(publications)

describe('/api/publications', () => {
  let publication
  beforeEach(() => {
    publication = cloneDeep(PublishedRelease)
  })

  afterEach(done => {
    Publication.remove({}, err => {
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
      .send(UnpublishedRelease)
      .set('Accept', 'application/json')
      .end(err => {
        if (err) { console.warn(err) }

        request(app)
          .post('/')
          .send(publication)
          .set('Accept', 'application/json')
          .end(err => {
            if (err) { console.warn(err) }
            done()
          })
      })
  }

  describe('POST / - New publication', () => {
    it('can create a publication', done => {
      request(app)
        .post('/')
        .send({ title: 'New Publication' })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          const { data, message } = res.body

          expect(message).toBe('Publication created')
          expect(data.title).toBe('New Publication')
          expect(data.slug).toBe('new-publication')
          expect(data._id).toBeTruthy()
          done()
        })
    })

    it('silently rejects fields not in schema', done => {
      request(app)
        .post('/')
        .send({ title: 'New Publication', extra: true, stuff: 'stuff' })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          const { data, message } = res.body

          expect(message).toBe('Publication created')
          expect(data.title).toBe('New Publication')
          expect(data.slug).toBe('new-publication')
          expect(data._id).toBeTruthy()
          expect(data.extra).toBeFalsy()
          expect(data.stuff).toBeFalsy()
          done()
        })
    })
  })

  describe('GET / - Fetch all publications', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('can fetch all publications', done => {
      request(app)
        .get('/')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }

          expect(res.body.length).toBe(2)
          expect(res.body[0].title).toBe(UnpublishedRelease.title)
          expect(res.body[1].title).toBe(publication.title)
          done()
        })
    })

    it('Can query for published publications only', done => {
      request(app)
        .get('/')
        .query({ published: true })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }

          expect(res.body.length).toBe(1)
          expect(res.body[0].title).toBe(publication.title)
          done()
        })
    })
  })

  describe('GET /:id - Fetch single publication', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('returns an publication by slug', done => {
      request(app)
        .get('/das-audit-pioneer-works-live')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          expect(res.body.title).toBe(UnpublishedRelease.title)
          done()
        })
    })

    it('returns an publication by _id', done => {
      request(app)
        .get('/5a496f9c688c1114024b497c')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          expect(res.body.title).toBe(UnpublishedRelease.title)
          done()
        })
    })

    it('can query for published publications', done => {
      request(app)
        .get('/5a496f9c688c1114024b497c')
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

  describe('PUT /:id - Update single publication', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('Updates a publication by slug', done => {
      request(app)
        .put('/das-audit-pioneer-works-live')
        .send({ title: 'New Title' })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          expect(res.body.title).toBe('New Title')
          expect(res.body.slug).toBe('das-audit-new-title')
          expect(res.body.description).toBe(UnpublishedRelease.description)
          done()
        })
    })

    it('Updates a publication by _id', done => {
      request(app)
        .put('/5a496f9c688c1114024b497c')
        .send({ title: 'New Title' })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          expect(res.body.title).toBe('New Title')
          expect(res.body.slug).toBe('das-audit-new-title')
          expect(res.body.description).toBe(UnpublishedRelease.description)
          done()
        })
    })
  })

  describe('DELETE /:id - Update single publication', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('Updates a publication by slug', done => {
      request(app)
        .delete('/das-audit-pioneer-works-live')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          expect(res.body.message).toBe('Publication deleted')
          done()
        })
    })

    it('Updates a publication by _id', done => {
      request(app)
        .delete('/5a496f9c688c1114024b497c')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          expect(res.body.message).toBe('Publication deleted')
          done()
        })
    })
  })
})
