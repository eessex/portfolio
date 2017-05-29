var express = require('express');
var events = express.Router();
var Event = require('../../models/event');

events.route('/')
  // create event
  .post(function(req, res) {
    var event = new Event();
    event.name = req.body.name;
    event.save(function(err) {
      if (err)
        res.send(err);
      res.json({ message: 'Event created' });
    });
  })
  // all events
  .get(function(req, res) {
    Event.find(function(err, events) {
      if (err)
        res.send(err);
      res.json(events);
    });
  });

events.route('/:event_id')
  // single event
  .get(function(req, res) {
    Event.findById(req.params.event_id, function(err, event) {
      if (err)
        res.send(err);
      res.json(event);
    });
  })
 .delete(function(req, res) {
    Event.remove({
      _id: req.params.event_id
    }, function(err, event) {
      if (err)
        res.send(err);
      res.json({ message: 'Event deleted' });
    });
  });

module.exports = events;
