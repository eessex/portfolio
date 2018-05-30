var express = require('express')
var events = express.Router()
var Event = require('./schema')

events.route('/')
  // create event
  .post((req, res) => {
    var item = new Event()
    Object.assign(item, req.body).save((err, data) => {
      if (err) {
        return res.status(400).send(err)
      }
      res.json({ message: 'Event created', data })
    })
  })
  // all events
  .get((req, res) => {
    Event.find(req.query).sort({start_date: 'desc'}).exec(
      function (err, data) {
        if (err) {
          res.send(err)
        }
        res.json(data)
      }
    )
  })

events.route('/new')
  // new event
  .get((req, res) => {
    var data = new Event()
    res.json(data)
  })

events.route('/:event_id')
  // single event
  .get((req, res) => {
    Event.findById(req.params.event_id, (err, data) => {
      if (err) {
        return res.status(400).send(err)
      }
      res.json(data)
    })
  })
  .put((req, res) => {
    Event.findById(req.params.event_id, (err, data) => {
      if (err) {
        return res.status(400).send(err)
      }
      Object.assign(data, req.body).save((err, data) => {
        if (err) {
          return res.status(400).send(err)
        }
        res.json(data)
      })
    })
  })
  .delete((req, res) => {
    Event.remove({
      _id: req.params.event_id
    }, function (err) {
      if (err) {
        return res.status(400).send(err)
      }
      res.json({ message: 'Event deleted' })
    })
  })

module.exports = events
