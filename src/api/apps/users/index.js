import express from 'express'
import jwt from 'jsonwebtoken'
import User from './schema'
const { SESSION_SECRET } = process.env
const users = express.Router()

users.route('/')
  // create user
  .post((req, res) => {
    const user = new User()
    Object.assign(user, req.body).save((err, user) => {
      if (err) {
        return res.status(400).send({message: err.message})
      }
      const { email, _id } = user
      const session = jwt.sign({ email, _id }, SESSION_SECRET, { expiresIn: '30d' })

      res.json({
        message: 'User created',
        currentUser: { email, _id },
        session
      })
    })
  })

users.route('/session/create')
  // Login user
  .post((req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
      if (err) {
        return res.send(err)
      } else if (!user) {
        return res.send(400, { error: 'User not found' })
      } else {
        // test password match
        user.comparePassword(req.body.password, (err, isMatch) => {
          if (!isMatch || err) {
            return res.send(400, { error: (err || 'Incorrect password') })
          }
          const { email, _id } = user
          const session = jwt.sign({ email, _id }, SESSION_SECRET, { expiresIn: '30d' })
          return res.json({
            currentUser: { email, _id },
            session
          })
        })
      }
    })
  })

users.route('/:user_id')
  // single user
  .put((req, res) => {
    User.findById(req.params.user_id, (err, user) => {
      if (err) {
        return res.send(err)
      }
      Object.assign(user, req.body).save((err) => {
        if (err) {
          return res.send(err)
        }
        res.json({ message: 'User updated' })
      })
    })
  })
  .delete((req, res) => {
    User.remove({
      _id: req.params.user_id
    }, (err) => {
      if (err) {
        return res.send(err)
      }
      res.json({ message: 'User deleted' })
    })
  })

module.exports = users
