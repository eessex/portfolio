var express = require('express')
var users = express.Router()
var User = require('./schema')

// for /api/users/

users.route('/')
  // create user
  .post( (req, res) => {
    var user = new User()
    Object.assign(user, req.body).save((err, user) => {
      if (err)
        return res.status(400).send(err)
      res.json({ message: 'User created', user })
    })
  })
  // all users
  .get( (req, res) => {
    User.find(function(err, users) {
      if (err)
        return res.send(err)
      res.json(users)
    })
  })

users.route('/session/create')
  .post( (req, res) => {
    User.findOne({ email: req.body.email }, function(err, user) {
      if (err) {
        return res.send(err)
      } else if (!user) {
        return res.send(400, { error: 'User not found' })
      } else {
      // test password match
        user.comparePassword(req.body.password, function(err, isMatch) {
          if (!isMatch)
            return res.send(400, { error: 'Incorrect password' })
          return res.json(user) //sets user authenticated in store
        })
      }
    })
  })

users.route('/:user_id')
  // single user
  .get( (req, res) => {
    User.findById(req.params.user_id, (err, user) => {
      if (err)
        return res.send(err)
      res.json(user)
    })
  })
  .put( (req, res) => {
    User.findById(req.params.user_id, (err, user) => {
      if(err)
        return res.send(err)
      Object.assign(user, req.body).save((err, user) => {
        if(err)
          return res.send(err)
        res.json({ message: 'User updated', user })
      })
    })
  })
  .delete( (req, res) => {
    User.remove({
      _id: req.params.user_id
    }, function(err, user) {
      if (err)
        return res.send(err)
      res.json({ message: 'User deleted' })
    })
  })

module.exports = users
