var express = require('express')
var publications = express.Router()
var Publication = require('./schema')

publications.route('/')
  // create publication
  .post( (req, res) => {
    var item = new Publication()
    Object.assign(item, req.body).save((err, data) => {
      if (err)
        return res.status(400).send(err)
      res.json({ message: 'Publication created', data })
    })
  })
  // all publications
  .get((req, res) => {
    Publication.find(req.query).exec(function(err, data) {
      if (err)
        res.send(err)
      res.json(data)
    })
  })

publications.route('/new')
  // new publication
  .get((req, res) => {
    var data = new Publication
    res.json(data)
  })

publications.route('/:publication_id')
  // single publication
  .get( (req, res) => {
    Publication.findById(req.params.publication_id, (err, data) => {
      if (err)
        return res.status(400).send(err)
      res.json(data)
    })
  })
  .put( (req, res) => {
    Publication.findById(req.params.publication_id, (err, data) => {
      if(err)
        return res.status(400).send(err)
      Object.assign(data, req.body).save((err, data) => {
        if(err)
          return res.status(400).send(err)
        res.json(data)
      })
    })
  })
  .delete( (req, res) => {
    Publication.remove({
      _id: req.params.publication_id
    }, function(err, data) {
      if (err)
        return res.status(400).send(err)
      res.json({ message: 'Publication deleted' })
    })
  })

module.exports = publications
