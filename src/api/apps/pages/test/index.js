process.env.NODE_ENV = 'test'

var Page = require('../schema')
var chai = require('chai')
var chaiHttp = require('chai-http')
var server = require('../../../../../server')
var moment = require('moment')
require('mongoose')

chai.should()
chai.use(chaiHttp)

describe('Pages', () => {
  let page
  beforeEach(() => {
    page = new Page({ title: 'Cool Page' })
  })

  afterEach(done => {
    Page.remove({}, err => {
      if (err) {
        console.log(err)
      }
      done()
    })
  })

  describe('GET /api/pages', () => {
    beforeEach(done => {
      var publishedPage = new Page({ title: 'Published Page', published: true })
      chai.request(server).post('/api/pages').send(page).end((err, page) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).post('/api/pages').send(publishedPage).end((err, page) => {
          if (err) {
            console.log(err)
          }
          done()
        })
      })
    })

    it('it should GET all the pages', done => {
      chai.request(server).get('/api/pages').end((err, res) => {
        if (err) {
          console.log(err)
        }
        res.should.have.status(200)
        res.body.should.be.a('array')
        res.body.length.should.be.eql(2)
        res.body[0].slug.should.eql('cool-page')
        res.body[1].slug.should.eql('published-page')
        done()
      })
    })

    it('Can GET published pages', done => {
      chai.request(server).get('/api/pages').query({published: true}).end((err, res) => {
        if (err) {
          console.log(err)
        }
        res.should.have.status(200)
        res.body.should.be.a('array')
        res.body.length.should.be.eql(1)
        res.body[0].slug.should.eql('published-page')
        done()
      })
    })

    it('Can GET unpublished pages', done => {
      chai.request(server).get('/api/pages').query({published: false}).end((err, res) => {
        if (err) {
          console.log(err)
        }
        res.should.have.status(200)
        res.body.should.be.a('array')
        res.body.length.should.be.eql(1)
        res.body[0].slug.should.eql('cool-page')
        done()
      })
    })
  })

  describe('POST /api/pages', () => {
    it('can save a page', (done) => {
      chai.request(server).post('/api/pages').send(page).end((err, res) => {
        if (err) {
          console.log(err)
        }
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.data.title.should.eql('Cool Page')
        done()
      })
    })

    it('adds slug, updated_at, created_at and published field by default', done => {
      chai.request(server).post('/api/pages').send(page).end((err, res) => {
        if (err) {
          console.log(err)
        }
        var date = moment().format('YYYY-MM-DD')
        var created_at = moment(res.body.data.created_at).format('YYYY-MM-DD')
        var updated_at = moment(res.body.data.updated_at).format('YYYY-MM-DD')
        created_at.should.eql(date)
        updated_at.should.eql(date)
        res.body.data.slug.should.eql('cool-page')
        res.body.data.published.should.not.be.ok
        done()
      })
    })
  })

  describe('GET /api/pages/:id ', () => {
    it('it should GET a page by id', done => {
      page.save((err, page) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).get('/api/pages/' + page._id).send(page).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.title.should.eql('Cool Page')
          res.body.slug.should.eql('cool-page')
          res.body._id.should.eql(page.id)
          done()
        })
      })
    })

    it('it should GET a page by slug', done => {
      page.save((err, page) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).get('/api/pages/' + page.slug).send(page).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.title.should.eql('Cool Page')
          res.body.slug.should.eql('cool-page')
          done()
        })
      })
    })
  })

  describe('PUT /api/pages/:id', () => {
    it('it should UPDATE a page by id', done => {
      page.save((err, page) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).put('/api/pages/' + page.id).send({title: 'Updated Page'}).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.title.should.eql('Updated Page')
          done()
        })
      })
    })

    it('it should UPDATE a page by slug', done => {
      page.save((err, page) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).put('/api/pages/' + page.id).send({title: 'Updated Page'}).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.title.should.eql('Updated Page')
          done()
        })
      })
    })
  })

  describe('DELETE /api/pages/:id', () => {
    it('it should DELETE a page by id', done => {
      page.save((err, page) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).delete('/api/pages/' + page.id).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('message').eql('Page deleted')
          done()
        })
      })
    })

    it('it should DELETE a page by slug', done => {
      page.save((err, page) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).delete('/api/pages/' + page.slug).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('message').eql('Page deleted')
          done()
        })
      })
    })
  })
})
