var express = require('express')
var projects = express.Router()
var Project = require('../../models/project')

projects.route('/')
  // create project
  .post( (req, res) => {
    var item = new Project()
    Object.assign(item, req.body).save((err, data) => {
      if (err)
        return res.status(400).send(err)
      res.json({ message: 'Project created', data })
    })
  })
  // all projects
  .get((req, res) => {
    Project.find(req.query).sort({
      'list_index': 'asc'
    }).exec(function(err, projects) {
      if (err)
        res.send(err)
      res.json(data)
    })
  })

projects.route('/new')
  // new project
  .get((req, res) => {
    var data = new Project
    res.json(data)
  })

  projects.route('/:project_id')
  // single project
  .get( (req, res) => {
    Project.findById(req.params.project_id, (err, data) => {
      if (err)
        return res.status(400).send(err)
      res.json(data)
    })
  })
  .put( (req, res) => {
    Project.findById(req.params.project_id, (err, data) => {
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
    Project.remove({
      _id: req.params.project_id
    }, function(err, data) {
      if (err)
        return res.status(400).send(err)
      res.json({ message: 'Project deleted' })
    })
  })

module.exports = projects
