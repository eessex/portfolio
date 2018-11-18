import express from 'express'
import Settings from './schema'
const settings = express.Router()

settings.route('/')
  // create settings
  .post((req, res) => {
    const settings = new Settings()
    Object.assign(settings, req.body).save((err, settings) => {
      if (err) {
        return res.status(400).send(err)
      }
      res.json({ message: 'Settings created', settings })
    })
  })
  // all settings
  .get((req, res) => {
    Settings.findOne(req.query).exec((err, settings) => {
      if (err) {
        return res.status(400).send(err)
      }
      res.json(settings)
    })
  })

settings.route('/:id')
  // update settings
  .put((req, res) => {
    Settings.findById(req.params.id, (err, settings) => {
      if (err) {
        return res.status(400).send(err)
      }
      Object.assign(settings, req.body).save((err, settings) => {
        if (err) {
          return res.status(400).send(err)
        }
        res.json({ message: 'Settings updated', settings })
      })
    })
  })

module.exports = settings
