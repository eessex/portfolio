var express = require('express')
var pages = express.Router()
var Page = require('./schema')
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

pages.route('/')
  // create page
  .post((req, res) => {
    var item = new Page()
    Object.assign(item, req.body).save((err, data) => {
      if (err) {
        return res.status(400).send(err)
      }
      res.json({ message: 'Page created', data })
    })
  })
  // all pages
  .get((req, res) => {
    Page.find(req.query).exec(
      function (err, data) {
        if (err) {
          res.send(err)
        }
        res.json(data)
      }
    )
  })

pages.route('/new')
  // new page
  .get((req, res) => {
    var data = new Page()
    res.json(data)
  })

pages.route('/:id')
  // single page
  .get((req, res) => {
    var query = queryByIdOrSlug(req.params.id, req.query)

    Page.findOne(query, (err, data) => {
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
    Page.findOne(query, (err, data) => {
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
    Page.findOne(query, (err, data) => {
      if (err) {
        return res.status(400).send(err)
      }
      Page.remove({
        _id: data._id
      }, function (err) {
        if (err) {
          return res.status(400).send(err)
        }
        res.json({ message: 'Page deleted' })
      })
    })
  })

module.exports = pages
