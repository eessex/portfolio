var mongoose = require('mongoose')
var Schema = mongoose.Schema
var slug = require('mongoose-slug-generator')

mongoose.plugin(slug)

var EventSchema = new Schema({
  all_day: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  end_date: { type: Date, default: null },
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
      url: { type: String }
    }
  ],
  meta: {
    description: String
  },
  start_date: { type: Date, default: Date.now },
  slug: {
    type: String,
    slug: ['title'],
    slug_padding_size: 2,
    unique: true
  },
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
