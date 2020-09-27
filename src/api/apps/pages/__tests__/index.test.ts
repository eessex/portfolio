import { cloneDeep } from 'lodash'
import request from 'supertest'
import { connectTestDB, disconnectTestDB, testApp } from 'client/tests/dbUtils'
import { HomePage, InfoPage } from 'client/tests/fixtures/pages'
import { pages } from '../index'
import Page from '../schema'

const app = testApp.use(pages)

describe('/api/pages', () => {
  let page
  beforeEach(() => {
    page = cloneDeep(HomePage)
  })

  afterEach(done => {
    Page.deleteOne({}, err => {
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
      .send(InfoPage)
      .set('Accept', 'application/json')
      .end(err => {
        if (err) { console.warn(err) }

        request(app)
          .post('/')
          .send(page)
          .set('Accept', 'application/json')
          .end(err => {
            if (err) { console.warn(err) }
            done()
          })
      })
  }

  describe('POST / - New page', () => {
    it('can create a page', done => {
      request(app)
        .post('/')
        .send({ title: 'New Page' })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          const { data, message } = res.body

          expect(message).toBe('Page created')
          expect(data.title).toBe('New Page')
          expect(data.slug).toBe('new-page')
          expect(data._id).toBeTruthy()
          done()
        })
    })

    it('silently rejects fields not in schema', done => {
      request(app)
        .post('/')
        .send({ title: 'New Page', extra: true, stuff: 'stuff' })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          const { data, message } = res.body

          expect(message).toBe('Page created')
          expect(data.title).toBe('New Page')
          expect(data.slug).toBe('new-page')
          expect(data._id).toBeTruthy()
          expect(data.extra).toBeFalsy()
          expect(data.stuff).toBeFalsy()
          done()
        })
    })
  })

  describe('GET / - Fetch all pages', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('can fetch all pages', done => {
      request(app)
        .get('/')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }

          expect(res.body.length).toBe(2)
          expect(res.body[0].title).toBe(InfoPage.title)
          expect(res.body[1].title).toBe(page.title)
          done()
        })
    })

    it('Can query for published pages only', done => {
      request(app)
        .get('/')
        .query({ published: true })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }

          expect(res.body.length).toBe(1)
          expect(res.body[0].title).toBe(page.title)
          done()
        })
    })
  })

  describe('GET /:id - Fetch single page', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('returns an page by slug', done => {
      request(app)
        .get('/info')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }

          expect(res.body.title).toBe(InfoPage.title)
          done()
        })
    })

    it('returns an page by _id', done => {
      request(app)
        .get('/5bdcaadf15f08123420ae6b6')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }

          expect(res.body.title).toBe(InfoPage.title)
          done()
        })
    })

    it('can query for published pages', done => {
      request(app)
        .get('/5bdcaadf15f08123420ae6b6')
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

  describe('PUT /:id - Update single page', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('Updates a page by slug', done => {
      request(app)
        .put('/info')
        .send({ title: 'New Title' })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }

          expect(res.body.title).toBe('New Title')
          expect(res.body.slug).toBe('new-title')
          expect(res.body.description).toBe(InfoPage.description)
          done()
        })
    })

    it('Updates a page by _id', done => {
      request(app)
        .put('/5bdcaadf15f08123420ae6b6')
        .send({ title: 'New Title' })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }

          expect(res.body.title).toBe('New Title')
          expect(res.body.slug).toBe('new-title')
          expect(res.body.description).toBe(InfoPage.description)
          done()
        })
    })
  })

  describe('DELETE /:id - Update single page', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('Updates a page by slug', done => {
      request(app)
        .delete('/info')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          expect(res.body.message).toBe('Page deleted')
          done()
        })
    })

    it('Updates a page by _id', done => {
      request(app)
        .delete('/5bdcaadf15f08123420ae6b6')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          expect(res.body.message).toBe('Page deleted')
          done()
        })
    })
  })
})
