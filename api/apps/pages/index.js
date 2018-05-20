var express = require('express')
var pages = express.Router()
var Page = require('./schema')

// for /api/pages/

pages.route('/')
  // create page
  .post( (req, res) => {
    var page = new Page()
    Object.assign(page, req.body).save((err, page) => {
      if (err)
        res.send(err)
      res.json({ message: 'Page created', page })
    })
  })
  // all pages
  .get( (req, res) => {
    Page.find(function(err, pages) {
      if (err)
        res.send(err)
      res.json(pages)
    })
  })

pages.route('/:page_id')
  // single page
  .get( (req, res) => {
    Page.findById(req.params.page_id, (err, page) => {
      if (err)
        res.send(err)
      res.json(page)
    })
  })
  .put( (req, res) => {
    Page.findById(req.params.page_id, (err, page) => {
      if(err)
        res.send(err)
      Object.assign(page, req.body).save((err, page) => {
        if(err)
          res.send(err)
        res.json({ message: 'Page updated', page })
      })
    })
  })
  .delete( (req, res) => {
    Page.remove({
      _id: req.params.page_id
    }, function(err, page) {
      if (err)
        res.send(err)
      res.json({ message: 'Page deleted' })
    })
  })

module.exports = pages
