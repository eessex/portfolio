var express = require('express')
var events = express.Router()
var Event = require('./schema')
var { extend } = require('lodash')

function queryByIdOrSlug (id, reqQuery = {}) {
  var query = extend(
    reqQuery,
    {$or: [{slug: id}]}
  )
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    query.$or.push({_id: id})
  }
  return query
}

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

events.route('/:id')
  // single event
  .get((req, res) => {
    var query = queryByIdOrSlug(req.params.id, req.query)
    Event.findOne(query, (err, data) => {
      if (err) {
        return res.status(400).send(err)
      }
      if (!data) {
        return res.status(404).send(new Error('not found'))
      }
      res.json(data)
    })
  })
  .put((req, res) => {
    var query = queryByIdOrSlug(req.params.id, req.query)
    Event.findOne(query, (err, data) => {
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
    var query = queryByIdOrSlug(req.params.id)
    Event.findOne(query, (err, data) => {
      if (err) {
        return res.status(400).send(err)
      }
      Event.remove({
        _id: data._id
      }, function (err) {
        if (err) {
          return res.status(400).send(err)
        }
        res.json({ message: 'Event deleted' })
      })
    })
  })

module.exports = events
