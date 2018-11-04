var express = require('express')
var publications = express.Router()
var Publication = require('./schema')
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

publications.route('/')
  // create publication
  .post((req, res) => {
    var item = new Publication()
    item.slug = item._id
    Object.assign(item, req.body).save((err, data) => {
      if (err) {
        return res.status(400).send(err)
      }
      res.json({ message: 'Publication created', data })
    })
  })
  // all publications
  .get((req, res) => {
    Publication.find(req.query).exec(
      function (err, data) {
        if (err) {
          res.send(err)
        }
        res.json(data)
      }
    )
  })

publications.route('/new')
  // new publication
  .get((req, res) => {
    var data = new Publication()
    res.json(data)
  })

publications.route('/:id')
  // single publication
  .get((req, res) => {
    var query = queryByIdOrSlug(req.params.id, req.query)
    Publication.findOne(query, (err, data) => {
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
    Publication.findOne(query, (err, data) => {
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
    Publication.findOne(query, (err, data) => {
      if (err) {
        return res.status(400).send(err)
      }
      Publication.remove({
        _id: data._id
      }, function (err) {
        if (err) {
          return res.status(400).send(err)
        }
        res.json({ message: 'Publication deleted' })
      })
    })
  })

module.exports = publications
