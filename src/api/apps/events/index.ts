import { extend } from 'lodash'
import express from 'express'
import Event from './schema'

export const events = express.Router()

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

events.route('/')
  // create event
  .post((req, res) => {
    const item = new Event()
    item.slug = item._id.toString()
    Object.assign(item, req.body).save((err, data) => {
      if (err) {
        return res.status(400).send(err)
      }
      res.json({ message: 'Event created', data })
    })
  })
  // all events
  .get((req, res) => {
    Event.find(req.query).sort({start_date: 'desc'}).exec((err, data) => {
      if (err) {
        res.send(err)
      }
      res.json(data)
    })
  })

events.route('/:id')
  // single event
  .get((req, res) => {
    const query = queryByIdOrSlug(req.params.id, req.query)
    Event.findOne(query, (err, data) => {
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
    Event.findOne(query, (err, data) => {
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
    Event.findOne(query, (err, data) => {
      if (err) {
        return res.status(400).send(err)
      }
      Event.deleteOne({
        _id: data._id
      }, (err) => {
        if (err) {
          return res.status(400).send(err)
        }
        res.json({ message: 'Event deleted' })
      })
    })
  })
