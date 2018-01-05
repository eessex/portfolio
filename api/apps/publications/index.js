var express = require('express')
var publications = express.Router()
var Publication = require('../../models/publication')

publications.route('/')
  // create publication
  .post( (req, res) => {
    var publication = new Publication()
    Object.assign(publication, req.body).save((err, publication) => {
      if (err)
        return res.status(400).send(err)
      res.json({ message: 'Publication created', publication })
    })
  })
  // all publications
  .get((req, res) => {
    Publication.find(req.query).sort({
      'formats.release_year': 'desc',
      artist: 'asc'
    }).exec(function(err, publications) {
      if (err)
        res.send(err)
      res.json(publications)
    })
  })

publications.route('/new')
  // new publication
  .get((req, res) => {
    var publication = new Publication
    res.json(publication)
  })

publications.route('/:publication_id')
  // single publication
  .get( (req, res) => {
    Publication.findById(req.params.publication_id, (err, publication) => {
      if (err)
        return res.status(400).send(err)
      res.json(publication)
    })
  })
  .put( (req, res) => {
    Publication.findById(req.params.publication_id, (err, publication) => {
      if(err)
        return res.status(400).send(err);
      Object.assign(publication, req.body).save((err, publication) => {
        if(err)
          return res.status(400).send(err)
        res.json({ message: 'Publication updated', publication })
      })
    })
  })
  .delete( (req, res) => {
    Publication.remove({
      _id: req.params.publication_id
    }, function(err, publication) {
      if (err)
        return res.status(400).send(err)
      res.json({ message: 'Publication deleted' })
    })
  })

module.exports = publications
