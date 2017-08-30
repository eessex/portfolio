var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventSchema = new Schema({
  title: String,
  venue: {
    name: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
  },
  start_date: { type: Date, default: Date.now },
  end_date: { type: Date, default: Date.now },
  all_day: { type: Boolean, default: false },
  description: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  published: { type: Boolean, default: false },
  links: [
    {
      title: { type: String },
      url: { type: String },
    }
  ],
  images: [
    {
      title: { type: String },
      url: { type: String },
      aspect: { type: Number }
    }
  ]
});

module.exports = mongoose.model('Event', EventSchema);