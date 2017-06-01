process.env.NODE_ENV = 'test';

var mongoose = require('mongoose');
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../server');
var should = chai.should();
var moment = require('moment');

chai.use(chaiHttp);

describe('Middleware Routes', () => {

  describe('GET /', () => {
    it('it should load index.html', (done) => {
      chai.request(server)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          res.text.should.contains('<script type="text/javascript" src="/dist/bundle.js">')
          done();
      });
    });
  });
  describe('GET /events', () => {
    it('it should load index.html', (done) => {
      chai.request(server)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          res.text.should.contains('<script type="text/javascript" src="/dist/bundle.js">')
          done();
      });
    });
  });
  describe('GET /pages', () => {
    it('it should load index.html', (done) => {
      chai.request(server)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          res.text.should.contains('<script type="text/javascript" src="/dist/bundle.js">')
          done();
      });
    });
  });
});