var mongoose = require('mongoose')
var Schema = mongoose.Schema

var EventSchema = new Schema({
  all_day: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  end_date: { type: Date, default: Date.now },
  embed_codes: [],
  description: String,
  images: [
    {
      caption: { type: String },
      url: { type: String },
      aspect: { type: Number }
    }
  ],
  links: [
    {
      title: { type: String },
      url: { type: String },
    }
  ],
  meta: {
    description: String,
  },
  start_date: { type: Date, default: Date.now },
  title: String,
  updated_at: { type: Date, default: Date.now },
  venue: {
    name: String,
    address: String,
    city: String,
    state: String,
    country: String
  },
  project_ids: { type: Array, default: [] },
  published: { type: Boolean, default: false }
})

module.exports = mongoose.model('Event', EventSchema)
