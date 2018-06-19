process.env.NODE_ENV = 'test';

var mongoose = require('mongoose');
var User = require('../../../models/user');
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../../../server');
var should = chai.should();
var moment = require('moment');

chai.use(chaiHttp);

describe('Users', () => {
  afterEach((done) => {
    User.remove({}, (err) => {
     done();
    });
  });

  describe('GET /api/users', () => {
    it('it should GET all the users', (done) => {
      chai.request(server)
        .get('/api/users')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
      });
    });
  });

 describe('POST /api/users', () => {
  it('can save a user', (done) => {
    var user = {
      name_first: 'Dolly',
      name_last: 'Parton',
      email: 'user@email.com',
      password: 'asdf123'
    }
    chai.request(server)
      .post('/api/users')
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.user.name_first.should.eql('Dolly');
        res.body.user.password.should.not.eql('asdf123');
        res.body.user.password.should.be > 7
        done();
      });
    });

  it('requires a unique email', (done) => {
    var user = {
      name_first: 'Jonny',
      name_last: 'Parton',
      email: 'user@email.com',
      password: 'password'
    }
    chai.request(server)
      .post('/api/users')
      .send(user)
      .end((err, res) => {
        res.should.not.have.status(200);
        done();
      });
    });

  it('adds an updated_at and created_at field by default', (done) => {
    var user = {
      name_first: 'Dolly',
      name_last: 'Parton',
      email: 'user@email.com',
      password: 'asdf123'
    }
    chai.request(server)
      .post('/api/users')
      .send(user)
      .end((err, res) => {
        var date = moment().format('YYYY-MM-DD');
        var created_at = moment(res.body.user.created_at).format('YYYY-MM-DD');
        var updated_at = moment(res.body.user.updated_at).format('YYYY-MM-DD');
        created_at.should.eql(date);
        updated_at.should.eql(date);
        done();
      });
    });
  });

describe('POST /api/users/sessions/create', () => {
  it('can verify a user login', (done) => {
    let user = new User({
      name_first: 'Dolly',
      name_last: 'Parton',
      email: 'user@email.com',
      password: 'asdf123'
    })
    user.save((err, user) => {
      chai.request(server)
      .post('/api/users/sessions/create')
      .send({email: 'user@email.com', password: 'asdf123'})
      .end((err, res) => {
        // console.log(user)
        // res.should.have.status(200);
        // res.body.should.be.a('object');
        // res.body.should.have.property('message').eql('User deleted');
        done();
      });
    });
  });
});

  describe('GET /api/users/:user_id ', () => {

    it('it should GET a user by id', (done) => {
      let user = new User({
        name_first: 'Dolly',
        name_last: 'Parton',
        email: 'user@email.com',
        password: 'asdf123'
	    });
      user.save((err, user) => {
        chai.request(server)
        .get('/api/users/' + user.id)
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.name_first.should.eql('Dolly');
          res.body.should.have.property('_id').eql(user.id);
          done();
        });
      });
    });
  });

  describe('PUT /api/users/:user_id', () => {
    it('it should UPDATE a user by id', (done) => {
      let user = new User({
        name_first: 'Dolly',
        name_last: 'Parton',
        email: 'user@email.com',
        password: 'asdf123'
	    })
      user.save((err, user) => {
        chai.request(server)
        .put('/api/users/' + user.id)
        .send({name_first: 'Dottie'})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('User updated');
          res.body.user.should.have.property('name_first').eql('Dottie');
          done();
        });
      });
    });
  });

  describe('DELETE /api/users/:user_id user', () => {
    it('it should DELETE an user by id', (done) => {
      let user = new User({
        name_first: 'Dolly',
        name_last: 'Parton',
        email: 'user@email.com',
        password: 'asdf123'
      })
      user.save((err, user) => {
        chai.request(server)
        .delete('/api/users/' + user.id)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('User deleted');
          done();
        });
      });
    });
  });

});

