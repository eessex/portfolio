process.env.NODE_ENV = 'test'

var Event = require('../schema')
var chai = require('chai')
var chaiHttp = require('chai-http')
var server = require('../../../../../server')
var moment = require('moment')
require('mongoose')

chai.should()
chai.use(chaiHttp)

describe('Events', () => {
  let event
  beforeEach(() => {
    event = new Event({ title: 'Cool Event' })
  })

  afterEach(done => {
    Event.remove({}, err => {
      if (err) {
        console.log(err)
      }
      done()
    })
  })

  describe('GET /api/events', () => {
    beforeEach(done => {
      var publishedEvent = new Event({ title: 'Published Event', published: true })
      chai.request(server).post('/api/events').send(event).end((err, event) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).post('/api/events').send(publishedEvent).end((err, event) => {
          if (err) {
            console.log(err)
          }
          done()
        })
      })
    })
    it('it should GET all the events', done => {
      chai.request(server).get('/api/events').end((err, res) => {
        if (err) {
          console.log(err)
        }
        res.should.have.status(200)
        res.body.should.be.a('array')
        res.body.length.should.be.eql(2)
        res.body[0].slug.should.eql('published-event')
        res.body[1].slug.should.eql('cool-event')
        done()
      })
    })

    it('Can GET published events', done => {
      chai.request(server).get('/api/events').query({published: true}).end((err, res) => {
        if (err) {
          console.log(err)
        }
        res.should.have.status(200)
        res.body.should.be.a('array')
        res.body.length.should.be.eql(1)
        res.body[0].slug.should.eql('published-event')
        done()
      })
    })

    it('Can GET unpublished events', done => {
      chai.request(server).get('/api/events').query({published: false}).end((err, res) => {
        if (err) {
          console.log(err)
        }
        res.should.have.status(200)
        res.body.should.be.a('array')
        res.body.length.should.be.eql(1)
        res.body[0].slug.should.eql('cool-event')
        done()
      })
    })
  })

  describe('POST /api/events', () => {
    it('can save an event', (done) => {
      chai.request(server).post('/api/events').send(event).end((err, res) => {
        if (err) {
          console.log(err)
        }
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.data.title.should.eql('Cool Event')
        done()
      })
    })

    it('adds slug, updated_at, created_at and published field by default', done => {
      chai.request(server).post('/api/events').send(event).end((err, res) => {
        if (err) {
          console.log(err)
        }
        var date = moment().format('YYYY-MM-DD')
        var created_at = moment(res.body.data.created_at).format('YYYY-MM-DD')
        var updated_at = moment(res.body.data.updated_at).format('YYYY-MM-DD')
        created_at.should.eql(date)
        updated_at.should.eql(date)
        res.body.data.slug.should.eql('cool-event')
        res.body.data.published.should.not.be.ok
        done()
      })
    })
  })

  describe('GET /api/events/:id ', () => {
    it('it should GET an event by id', done => {
      event.save((err, event) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).get('/api/events/' + event._id).send(event).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.title.should.eql('Cool Event')
          res.body.slug.should.eql('cool-event')
          res.body._id.should.eql(event.id)
          done()
        })
      })
    })

    it('it should GET an event by slug', done => {
      event.save((err, event) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).get('/api/events/' + event.slug).send(event).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.title.should.eql('Cool Event')
          res.body.slug.should.eql('cool-event')
          done()
        })
      })
    })
  })

  describe('PUT /api/events/:id', () => {
    it('it should UPDATE an event by id', done => {
      event.save((err, event) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).put('/api/events/' + event.id).send({title: 'Updated Event'}).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.title.should.eql('Updated Event')
          done()
        })
      })
    })

    it('it should UPDATE an event by slug', done => {
      event.save((err, event) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).put('/api/events/' + event.id).send({title: 'Updated Event'}).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.title.should.eql('Updated Event')
          done()
        })
      })
    })
  })

  describe('DELETE /api/events/:id', () => {
    it('it should DELETE an event by id', done => {
      event.save((err, event) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).delete('/api/events/' + event.id).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('message').eql('Event deleted')
          done()
        })
      })
    })

    it('it should DELETE an event by slug', done => {
      event.save((err, event) => {
        if (err) {
          console.log(err)
        }
        chai.request(server).delete('/api/events/' + event.slug).end((err, res) => {
          if (err) {
            console.log(err)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('message').eql('Event deleted')
          done()
        })
      })
    })
  })
})
