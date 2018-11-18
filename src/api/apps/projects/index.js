import { extend } from 'lodash'
import express from 'express'
import Project from './schema'
const projects = express.Router()

export const queryByIdOrSlug = (id, reqQuery = {}) => {
  var query = extend(
    reqQuery,
    {$or: [{slug: id}]}
  )
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    query.$or.push({_id: id})
  }
  return query
}

projects.route('/')
  // create project
  .post((req, res) => {
    var item = new Project()
    item.slug = item._id
    Object.assign(item, req.body).save((err, data) => {
      if (err) {
        return res.status(400).send(err)
      }
      res.json({ message: 'Project created', data })
    })
  })
  // all projects
  .get((req, res) => {
    Project.find(req.query).sort({'list_index': 'asc'}).exec((err, data) => {
      if (err) {
        res.send(err)
      }
      res.json(data)
    })
  })

projects.route('/:id')
  // single projects
  .get((req, res) => {
    var query = queryByIdOrSlug(req.params.id, req.query)
    Project.findOne(query, (err, data) => {
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
    Project.findOne(query, (err, data) => {
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
    Project.findOne(query, (err, data) => {
      if (err) {
        return res.status(400).send(err)
      }
      Project.remove({
        _id: data._id
      }, function (err) {
        if (err) {
          return res.status(400).send(err)
        }
        res.json({ message: 'Project deleted' })
      })
    })
  })

module.exports = projects
