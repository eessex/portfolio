var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventSchema = new Schema({
  title: String,
  venue: {
    name: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  start_date: { type: Date, default: Date.now, required: true },
  end_date: { type: Date, default: Date.now },
  all_day: { type: Boolean, default: false},
  description: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  published: { type: Boolean, default: false }
});

EventSchema.pre('save', function(next) {
  var now = new Date();
  if(!this.created_at) {
    this.created_at = now;
  }
  this.updated_at = now;
  next();
});

module.exports = mongoose.model('Event', EventSchema);