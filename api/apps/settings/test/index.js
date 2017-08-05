process.env.NODE_ENV = 'test';

var mongoose = require('mongoose');
var Setting = require('../../../models/settings');
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../../../server');
var should = chai.should();
var moment = require('moment');

chai.use(chaiHttp);

describe('Settings', () => {
  afterEach((done) => {
    Setting.remove({}, (err) => {
     done();
    });
  });

  describe('GET /api/settings', () => {
    it('it should GET all the settings', (done) => {
      chai.request(server)
        .get('/api/settings')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
      });
    });
  });

 describe('POST /api/settings', () => {
  it('can save an setting', (done) => {
    var setting = {
      title: 'A New Setting'
    }
    chai.request(server)
      .post('/api/settings')
      .send(setting)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.setting.title.should.eql('A New Setting');
        done();
      });
    });

  it('adds an updated_at, created_at and published field by default', (done) => {
    var setting = {
      title: 'A New Setting'
    }
    chai.request(server)
      .post('/api/settings')
      .send(setting)
      .end((err, res) => {
        var date = moment().format('YYYY-MM-DD');
        var created_at = moment(res.body.setting.created_at).format('YYYY-MM-DD');
        var updated_at = moment(res.body.setting.updated_at).format('YYYY-MM-DD');
        created_at.should.eql(date);
        updated_at.should.eql(date);
        res.body.setting.published.should.not.be.ok;
        done();
      });
    });
  });
});

