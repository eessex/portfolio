var express = require('express');
var users = express.Router();
var User = require('../../models/user');

// for /api/users/

users.route('/')
  // create user
  .post( (req, res) => {
    var user = new User();
    user.name_first = req.body.name_first;
    user.name_last = req.body.name_last;
    user.email = req.body.email;
    user.password = req.body.password;
    user.save( (err, user) => {
      if (err)
        res.send(err);
      res.json({ message: 'User created', user });
    });
  })
  // all users
  .get( (req, res) => {
    User.find(function(err, users) {
      if (err)
        res.send(err);
      res.json(users);
    });
  });

users.route('/:user_id')
  // single user
  .get( (req, res) => {
    User.findById(req.params.user_id, (err, user) => {
      if (err)
        res.send(err);
      res.json(user);
    });
  })
  .put( (req, res) => {
    User.findById(req.params.user_id, (err, user) => {
      if(err)
        res.send(err);
      Object.assign(user, req.body).save((err, user) => {
        if(err)
          res.send(err);
        res.json({ message: 'User updated', user });
      });
    });
  })
  .delete( (req, res) => {
    User.remove({
      _id: req.params.user_id
    }, function(err, user) {
      if (err)
        res.send(err);
      res.json({ message: 'User deleted' });
    });
  });

module.exports = users;
