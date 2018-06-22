var express = require('express')
var settings = express.Router()
var Settings = require('./schema')

// for /api/settings/

settings.route('/')
  // create setting
  .post((req, res) => {
    var settings = new Settings()
    Object.assign(settings, req.body).save((err, settings) => {
      if (err) {
        return res.status(400).send(err)
      }
      res.json({ message: 'Settings created', settings })
    })
  })
  // all settings
  .get((req, res) => {
    Settings.find(req.query).sort({start_date: 'desc'}).exec(
      function (err, settings) {
        if (err) {
          res.send(err)
        }
        res.json(settings)
      }
    )
  })

settings.route('/:settings_id')
  // update settings
  .put((req, res) => {
    Settings.findById(req.params.settings_id, (err, settings) => {
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