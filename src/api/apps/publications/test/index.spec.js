process.env.NODE_ENV = 'test'

var Publication = require('../schema')
var chai = require('chai')
var chaiHttp = require('chai-http')
var server = require('../../../../../server')
var moment = require('moment')
require('mongoose')

chai.should()
chai.use(chaiHttp)

describe('Publications', () => {
  let publication
  beforeEach(() => {
    publication = new Publication({ title: 'Cool Publication' })
  })

  afterEach(done => {
    Publication.remove({}, err => {
      if (err) {
        console.log(err)
      }
      done()
    })
  })

  describe('GET /api/publications', () => {
    beforeEach(done => {
      var publishedPublication = new Publication({ title: 'Published Publication', published: true })
      chai.request(server).post('/api/publications').send(publication).end((err, publication) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).post('/api/publications').send(publishedPublication).end((err, publication) => {
          if (err) {
            console.log(err)
          }
          done()
        })
      })
    })
    it('it should GET all the publications', done => {
      chai.request(server).get('/api/publications').end((err, res) => {
        if (err) {
          console.log(err)
        }
        res.should.have.status(200)
        res.body.should.be.a('array')
        res.body.length.should.be.eql(2)
        res.body[0].slug.should.eql('cool-publication')
        res.body[1].slug.should.eql('published-publication')
        done()
      })
    })

    it('Can GET published publications', done => {
      chai.request(server).get('/api/publications').query({published: true}).end((err, res) => {
        if (err) {
          console.log(err)
        }
        res.should.have.status(200)
        res.body.should.be.a('array')
        res.body.length.should.be.eql(1)
        res.body[0].slug.should.eql('published-publication')
        done()
      })
    })

    it('Can GET unpublished publications', done => {
      chai.request(server).get('/api/publications').query({published: false}).end((err, res) => {
        if (err) {
          console.log(err)
        }
        res.should.have.status(200)
        res.body.should.be.a('array')
        res.body.length.should.be.eql(1)
        res.body[0].slug.should.eql('cool-publication')
        done()
      })
    })
  })

  describe('POST /api/publications', () => {
    it('can save a publication', (done) => {
      chai.request(server).post('/api/publications').send(publication).end((err, res) => {
        if (err) {
          console.log(err)
        }
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.data.title.should.eql('Cool Publication')
        done()
      })
    })

    it('adds slug, updated_at, created_at and published field by default', done => {
      publication.artist = 'The Artist'
      chai.request(server).post('/api/publications').send(publication).end((err, res) => {
        if (err) {
          console.log(err)
        }
        var date = moment().format('YYYY-MM-DD')
        var created_at = moment(res.body.data.created_at).format('YYYY-MM-DD')
        var updated_at = moment(res.body.data.updated_at).format('YYYY-MM-DD')
        created_at.should.eql(date)
        updated_at.should.eql(date)
        res.body.data.slug.should.eql('the-artist-cool-publication')
        res.body.data.published.should.not.be.ok
        done()
      })
    })
  })

  describe('GET /api/publications/:id ', () => {
    it('it should GET an publication by id', done => {
      publication.save((err, publication) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).get('/api/publications/' + publication._id).send(publication).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.title.should.eql('Cool Publication')
          res.body.slug.should.eql('cool-publication')
          res.body._id.should.eql(publication.id)
          done()
        })
      })
    })

    it('it should GET an publication by slug', done => {
      publication.save((err, publication) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).get('/api/publications/' + publication.slug).send(publication).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.title.should.eql('Cool Publication')
          res.body.slug.should.eql('cool-publication')
          done()
        })
      })
    })
  })

  describe('PUT /api/publications/:id', () => {
    it('it should UPDATE a publication by id', done => {
      publication.save((err, publication) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).put('/api/publications/' + publication.id).send({title: 'Updated Publication'}).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.title.should.eql('Updated Publication')
          done()
        })
      })
    })

    it('it should UPDATE a publication by slug', done => {
      publication.save((err, publication) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).put('/api/publications/' + publication.id).send({title: 'Updated Publication'}).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.title.should.eql('Updated Publication')
          done()
        })
      })
    })
  })

  describe('DELETE /api/publication/:id', () => {
    it('it should DELETE a publication by id', done => {
      publication.save((err, publication) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).delete('/api/publications/' + publication.id).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('message').eql('Publication deleted')
          done()
        })
      })
    })

    it('it should DELETE a publication by slug', done => {
      publication.save((err, publication) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).delete('/api/publications/' + publication.slug).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('message').eql('Publication deleted')
          done()
        })
      })
    })
  })
})
