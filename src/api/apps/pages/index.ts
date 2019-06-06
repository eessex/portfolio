import { extend } from 'lodash'
import express from 'express'
import Page from './schema'

export const pages = express.Router()

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

pages.route('/')
  // create page
  .post((req, res) => {
    const item = new Page()
    item.slug = item._id
    Object.assign(item, req.body).save((err, data) => {
      if (err) {
        return res.status(400).send(err)
      }
      res.json({ message: 'Page created', data })
    })
  })
  // all pages
  .get((req, res) => {
    Page.find(req.query).exec((err, data) => {
      if (err) {
        res.send(err)
      }
      res.json(data)
    })
  })

pages.route('/:id')
  // single page
  .get((req, res) => {
    const query = queryByIdOrSlug(req.params.id, req.query)

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
    const query = queryByIdOrSlug(req.params.id, req.query)
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
    const query = queryByIdOrSlug(req.params.id)
    Page.findOne(query, (err, data) => {
      if (err) {
        return res.status(400).send(err)
      }
      Page.remove({
        _id: data._id
      }, (err) => {
        if (err) {
          return res.status(400).send(err)
        }
        res.json({ message: 'Page deleted' })
      })
    })
  })
