var express = require('express');
var events = express.Router();
var Event = require('../../models/event');

// for /api/events/

events.route('/')
  // create event
  .post( (req, res) => {
    var event = new Event();
    Object.assign(event, req.body).save((err, event) => {
      if (err)
        res.status(400).send(err);
      res.json({ message: 'Event created', event });
    });
  })
  // all events
  .get( (req, res) => {
    Event.find(function(err, events) {
      if (err)
        res.send(err);
      res.json(events);
    });
  });

events.route('/new')
  // new event
  .get( (req, res) => {
      var event = new Event
      res.json(event);
  });

events.route('/:event_id')
  // single event
  .get( (req, res) => {
    Event.findById(req.params.event_id, (err, event) => {
      if (err)
        res.status(400).send(err);
      res.json(event);
    });
  })
  .put( (req, res) => {
    Event.findById(req.params.event_id, (err, event) => {
      if(err)
        res.send(err);
      Object.assign(event, req.body).save((err, event) => {
        if(err)
          res.send(err);
        res.json({ message: 'Event updated', event });
      });
    });
  })
  .delete( (req, res) => {
    Event.remove({
      _id: req.params.event_id
    }, function(err, event) {
      if (err)
        res.send(err);
      res.json({ message: 'Event deleted' });
    });
  });

module.exports = events;
