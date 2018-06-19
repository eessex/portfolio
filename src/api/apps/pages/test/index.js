process.env.NODE_ENV = 'test';

var mongoose = require('mongoose');
var Page = require('../../../models/page');
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../../../server');
var should = chai.should();
var moment = require('moment');

chai.use(chaiHttp);

describe('Pages', () => {
  afterEach((done) => {
    Page.remove({}, (err) => {
     done();
    });
  });

  describe('GET /api/pages', () => {
    it('it should GET all the pages', (done) => {
      chai.request(server)
        .get('/api/pages')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
      });
    });
  });

 describe('POST /api/pages', () => {
  it('can save an page', (done) => {
    var page = {
      title: 'A New Page'
    }
    chai.request(server)
      .post('/api/pages')
      .send(page)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.page.title.should.eql('A New Page');
        done();
      });
    });

  it('adds an updated_at, created_at and published field by default', (done) => {
    var page = {
      title: 'A New Page'
    }
    chai.request(server)
      .post('/api/pages')
      .send(page)
      .end((err, res) => {
        var date = moment().format('YYYY-MM-DD');
        var created_at = moment(res.body.page.created_at).format('YYYY-MM-DD');
        var updated_at = moment(res.body.page.updated_at).format('YYYY-MM-DD');
        created_at.should.eql(date);
        updated_at.should.eql(date);
        res.body.page.published.should.not.be.ok;
        done();
      });
    });
  });

  describe('GET /api/pages/:page_id ', () => {

    it('it should GET an page by id', (done) => {
      let page = new Page({ title: 'Cool Page' });
      page.save((err, page) => {
        chai.request(server)
        .get('/api/pages/' + page.id)
        .send(page)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.title.should.eql('Cool Page');
          res.body.should.have.property('_id').eql(page.id);
          done();
        });
      });
    });
  });

  describe('PUT /api/pages/:page_id', () => {
    it('it should UPDATE a pages by id', (done) => {
      let page = new Page({title: 'New Page'})
      page.save((err, page) => {
        chai.request(server)
        .put('/api/pages/' + page.id)
        .send({title: 'Updated Page'})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Page updated');
          res.body.page.should.have.property('title').eql('Updated Page');
          done();
        });
      });
    });
  });

  describe('DELETE /api/pages/:page_id page', () => {
    it('it should DELETE an page by id', (done) => {
      let page = new Page({title: 'New Page'})
      page.save((err, page) => {
        chai.request(server)
        .delete('/api/pages/' + page.id)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Page deleted');
          done();
        });
      });
    });
  });

});

