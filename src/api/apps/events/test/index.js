process.env.NODE_ENV = 'test';

var mongoose = require('mongoose');
var Event = require('../../../models/event');
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../../../server');
var should = chai.should();
var moment = require('moment');

chai.use(chaiHttp);

describe('Events', () => {
  afterEach((done) => {
    Event.remove({}, (err) => {
     done();
    });
  });

  describe('GET /api/events', () => {
    it('it should GET all the events', (done) => {
      chai.request(server)
        .get('/api/events')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
      });
    });
  });

 describe('POST /api/events', () => {
  it('can save an event', (done) => {
    var event = {
      title: 'A New Event'
    }
    chai.request(server)
      .post('/api/events')
      .send(event)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.event.title.should.eql('A New Event');
        done();
      });
    });

  it('adds an updated_at, created_at and published field by default', (done) => {
    var event = {
      title: 'A New Event'
    }
    chai.request(server)
      .post('/api/events')
      .send(event)
      .end((err, res) => {
        var date = moment().format('YYYY-MM-DD');
        var created_at = moment(res.body.event.created_at).format('YYYY-MM-DD');
        var updated_at = moment(res.body.event.updated_at).format('YYYY-MM-DD');
        created_at.should.eql(date);
        updated_at.should.eql(date);
        res.body.event.published.should.not.be.ok;
        done();
      });
    });
  });

  describe('GET /api/events/:event_id ', () => {

    it('it should GET an event by id', (done) => {
      let event = new Event({ title: 'Cool Event' });
      event.save((err, event) => {
        chai.request(server)
        .get('/api/events/' + event.id)
        .send(event)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.title.should.eql('Cool Event');
          res.body.should.have.property('_id').eql(event.id);
          done();
        });
      });
    });
  });

  describe('PUT /api/events/:event_id', () => {
    it('it should UPDATE a events by id', (done) => {
      let event = new Event({title: 'New Event'})
      event.save((err, event) => {
        chai.request(server)
        .put('/api/events/' + event.id)
        .send({title: 'Updated Event'})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Event updated');
          res.body.event.should.have.property('title').eql('Updated Event');
          done();
        });
      });
    });
  });

  describe('DELETE /api/events/:event_id event', () => {
    it('it should DELETE an event by id', (done) => {
      let event = new Event({title: 'New Event'})
      event.save((err, event) => {
        chai.request(server)
        .delete('/api/events/' + event.id)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Event deleted');
          done();
        });
      });
    });
  });

});

