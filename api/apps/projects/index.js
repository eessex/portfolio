var express = require('express')
var projects = express.Router()
var Project = require('../../models/project')

projects.route('/')
  // create project
  .post( (req, res) => {
    var item = new Project()
    Object.assign(item, req.body).save((err, item) => {
      if (err)
        return res.status(400).send(err)
      res.json({ message: 'Project created', item })
    })
  })
  // all projects
  .get((req, res) => {
    Project.find(req.query).exec(function(err, projects) {
      if (err)
        res.send(err)
      res.json(projects)
    })
  })

projects.route('/new')
  // new project
  .get((req, res) => {
    var project = new Project
    res.json(project)
  })

  projects.route('/:project_id')
  // single project
  .get( (req, res) => {
    Project.findById(req.params.project_id, (err, item) => {
      if (err)
        return res.status(400).send(err)
      res.json(item)
    })
  })
  .put( (req, res) => {
    Project.findById(req.params.project_id, (err, item) => {
      if(err)
        return res.status(400).send(err);
      Object.assign(item, req.body).save((err, item) => {
        if(err)
          return res.status(400).send(err)
        res.json({ message: 'Project updated', item })
      })
    })
  })
  .delete( (req, res) => {
    Project.remove({
      _id: req.params.project_id
    }, function(err, item) {
      if (err)
        return res.status(400).send(err)
      res.json({ message: 'Project deleted' })
    })
  })

module.exports = projects
