process.env.NODE_ENV = 'test'

var Project = require('../schema')
var chai = require('chai')
var chaiHttp = require('chai-http')
var server = require('../../../../../server')
var moment = require('moment')
require('mongoose')

chai.should()
chai.use(chaiHttp)

describe('Projects', () => {
  let project
  beforeEach(() => {
    project = new Project({ title: 'Cool Project' })
  })

  afterEach(done => {
    Project.remove({}, err => {
      if (err) {
        console.log(err)
      }
      done()
    })
  })

  describe('GET /api/projects', () => {
    beforeEach(done => {
      var publishedProject = new Project({ title: 'Published Project', published: true })
      chai.request(server).post('/api/projects').send(project).end((err, project) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).post('/api/projects').send(publishedProject).end((err, project) => {
          if (err) {
            console.log(err)
          }
          done()
        })
      })
    })
    it('it should GET all the projects', done => {
      chai.request(server).get('/api/projects').end((err, res) => {
        if (err) {
          console.log(err)
        }
        res.should.have.status(200)
        res.body.should.be.a('array')
        res.body.length.should.be.eql(2)
        res.body[0].slug.should.eql('cool-project')
        res.body[1].slug.should.eql('published-project')
        done()
      })
    })

    it('Can GET published projects', done => {
      chai.request(server).get('/api/projects').query({published: true}).end((err, res) => {
        if (err) {
          console.log(err)
        }
        res.should.have.status(200)
        res.body.should.be.a('array')
        res.body.length.should.be.eql(1)
        res.body[0].slug.should.eql('published-project')
        done()
      })
    })

    it('Can GET unpublished projects', done => {
      chai.request(server).get('/api/projects').query({published: false}).end((err, res) => {
        if (err) {
          console.log(err)
        }
        res.should.have.status(200)
        res.body.should.be.a('array')
        res.body.length.should.be.eql(1)
        res.body[0].slug.should.eql('cool-project')
        done()
      })
    })
  })

  describe('POST /api/projects', () => {
    it('can save a project', (done) => {
      chai.request(server).post('/api/projects').send(project).end((err, res) => {
        if (err) {
          console.log(err)
        }
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.data.title.should.eql('Cool Project')
        done()
      })
    })

    it('adds slug, updated_at, created_at and published field by default', done => {
      chai.request(server).post('/api/projects').send(project).end((err, res) => {
        if (err) {
          console.log(err)
        }
        var date = moment().format('YYYY-MM-DD')
        var created_at = moment(res.body.data.created_at).format('YYYY-MM-DD')
        var updated_at = moment(res.body.data.updated_at).format('YYYY-MM-DD')
        created_at.should.eql(date)
        updated_at.should.eql(date)
        res.body.data.slug.should.eql('cool-project')
        // res.body.data.published.should.not.be.ok
        done()
      })
    })
  })

  describe('GET /api/projects/:id ', () => {
    it('it should GET an project by id', done => {
      project.save((err, project) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).get('/api/projects/' + project._id).send(project).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.title.should.eql('Cool Project')
          res.body.slug.should.eql('cool-project')
          res.body._id.should.eql(project.id)
          done()
        })
      })
    })

    it('it should GET an project by slug', done => {
      project.save((err, project) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).get('/api/projects/' + project.slug).send(project).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.title.should.eql('Cool Project')
          res.body.slug.should.eql('cool-project')
          done()
        })
      })
    })
  })

  describe('PUT /api/projects/:id', () => {
    it('it should UPDATE a project by id', done => {
      project.save((err, project) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).put('/api/projects/' + project.id).send({title: 'Updated Project'}).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.title.should.eql('Updated Project')
          done()
        })
      })
    })

    it('it should UPDATE a project by slug', done => {
      project.save((err, project) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).put('/api/projects/' + project.id).send({title: 'Updated Project'}).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.title.should.eql('Updated Project')
          done()
        })
      })
    })
  })

  describe('DELETE /api/project/:id', () => {
    it('it should DELETE a project by id', done => {
      project.save((err, project) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).delete('/api/projects/' + project.id).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('message').eql('Project deleted')
          done()
        })
      })
    })

    it('it should DELETE a project by slug', done => {
      project.save((err, project) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).delete('/api/projects/' + project.slug).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('message').eql('Project deleted')
          done()
        })
      })
    })
  })
})
