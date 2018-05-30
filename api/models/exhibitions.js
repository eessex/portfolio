var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ExhibitionSchema = new Schema({
  title: String,
  venue: {
    name: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  start_date: { type: Date, default: Date.now },
  end_date: { type: Date, default: Date.now },
  description: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  published: { type: Boolean, default: false },
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
  ]
})

module.exports = mongoose.model('Exhibition', ExhibitionSchema)
