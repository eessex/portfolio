import { cloneDeep } from 'lodash'
import request from 'supertest'
import { connectTestDB, disconnectTestDB, testApp } from 'client/tests/dbUtils'
import { PublishedProject, UnpublishedProject } from 'client/tests/fixtures/projects'
import projects from '../index'
import Project from '../schema'

const app = testApp.use(projects)

describe('/api/projects', () => {
  let project
  beforeEach(() => {
    project = cloneDeep(PublishedProject)
  })

  afterEach(done => {
    Project.remove({}, err => {
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
      .send(UnpublishedProject)
      .set('Accept', 'application/json')
      .end(err => {
        if (err) { console.warn(err) }

        request(app)
          .post('/')
          .send(project)
          .set('Accept', 'application/json')
          .end(err => {
            if (err) { console.warn(err) }
            done()
          })
      })
  }

  describe('POST / - New project', () => {
    it('can create a project', done => {
      request(app)
        .post('/')
        .send({ title: 'New Project' })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          const { data, message } = res.body

          expect(message).toBe('Project created')
          expect(data.title).toBe('New Project')
          expect(data.slug).toBe('new-project')
          expect(data._id).toBeTruthy()
          done()
        })
    })

    it('silently rejects fields not in schema', done => {
      request(app)
        .post('/')
        .send({ title: 'New Project', extra: true, stuff: 'stuff' })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          const { data, message } = res.body

          expect(message).toBe('Project created')
          expect(data.title).toBe('New Project')
          expect(data.slug).toBe('new-project')
          expect(data._id).toBeTruthy()
          expect(data.extra).toBeFalsy()
          expect(data.stuff).toBeFalsy()
          done()
        })
    })
  })

  describe('GET / - Fetch all projects', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('can fetch all projects ordered by list_index', done => {
      request(app)
        .get('/')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }

          expect(res.body.length).toBe(2)
          expect(res.body[0].title).toBe(UnpublishedProject.title)
          expect(res.body[1].title).toBe(project.title)
          done()
        })
    })

    it('Can query for published projects only', done => {
      request(app)
        .get('/')
        .query({ published: true })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }

          expect(res.body.length).toBe(1)
          expect(res.body[0].title).toBe(project.title)
          done()
        })
    })
  })

  describe('GET /:id - Fetch single project', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('returns an project by slug', done => {
      request(app)
        .get('/das-audit')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          expect(res.body.title).toBe(UnpublishedProject.title)
          done()
        })
    })

    it('returns an project by _id', done => {
      request(app)
        .get('/5a0673b00d5cea5c9e6e5d80')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          expect(res.body.title).toBe(UnpublishedProject.title)
          done()
        })
    })

    it('can query for published projects', done => {
      request(app)
        .get('/5a0673b00d5cea5c9e6e5d80')
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

  describe('PUT /:id - Update single project', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('Updates a project by slug', done => {
      request(app)
        .put('/das-audit')
        .send({ title: 'New Title' })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }

          expect(res.body.title).toBe('New Title')
          expect(res.body.slug).toBe('new-title')
          expect(res.body.description).toBe(UnpublishedProject.description)
          done()
        })
    })

    it('Updates a project by _id', done => {
      request(app)
        .put('/5a0673b00d5cea5c9e6e5d80')
        .send({ title: 'New Title' })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }

          expect(res.body.title).toBe('New Title')
          expect(res.body.slug).toBe('new-title')
          expect(res.body.description).toBe(UnpublishedProject.description)
          done()
        })
    })
  })

  describe('DELETE /:id - Update single project', () => {
    beforeEach(done => {
      seedData(done)
    })

    it('Updates a project by slug', done => {
      request(app)
        .delete('/das-audit')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          expect(res.body.message).toBe('Project deleted')
          done()
        })
    })

    it('Updates a project by _id', done => {
      request(app)
        .delete('/5a0673b00d5cea5c9e6e5d80')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) { console.warn(err) }
          expect(res.body.message).toBe('Project deleted')
          done()
        })
    })
  })
})
