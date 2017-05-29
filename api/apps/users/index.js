var express = require('express');
var users = express.Router();
var User = require('../../models/user');

users.route('/')
  // create user
  .post(function(req, res) {
    var user = new User();
    user.name = req.body.name;
    user.save(function(err) {
      if (err)
        res.send(err);
      res.json({ message: 'User created' });
    });
  })
  // all users
  .get(function(req, res) {
    User.find(function(err, users) {
      if (err)
        res.send(err);
      res.json(users);
    });
  });

users.route('/:user_id')
  // single user
  .get(function(req, res) {
    User.findById(req.params.user_id, function(err, user) {
      if (err)
        res.send(err);
      res.json(user);
    });
  });

module.exports = users;
