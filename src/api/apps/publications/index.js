import { extend } from 'lodash'
import express from 'express'
import Publication from './schema'

export const publications = express.Router()

const queryByIdOrSlug = (id, reqQuery = {}) => {
  const query = extend(
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
    const item = new Publication()
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
    Publication.find(req.query).exec((err, data) => {
      if (err) {
        res.send(err)
      }
      res.json(data)
    })
  })

publications.route('/:id')
  // single publication
  .get((req, res) => {
    const query = queryByIdOrSlug(req.params.id, req.query)
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
    const query = queryByIdOrSlug(req.params.id, req.query)
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
    const query = queryByIdOrSlug(req.params.id)
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
