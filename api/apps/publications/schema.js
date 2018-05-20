var mongoose = require('mongoose')
var Schema = mongoose.Schema

var PublicationSchema = new Schema({
  artist: String,
  title: String,
  formats: [
    {
      publisher: { type: String },
      format: { type: String },
      release_year: { type: Number },
      compilation: { type: Boolean, default: false },
      featuring: { type: Boolean, default: false }
    }
  ],
  embed_codes: { type: Array, default: [] },
  description: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  published: { type: Boolean, default: false },
  project_ids: { type: Array, default: [] },
  images: [
    {
      caption: { type: String },
      url: { type: String },
      aspect: { type: Number },
    }
  ],
  links: [
    {
      title: { type: String },
      url: { type: String },
    }
  ]
})

module.exports = mongoose.model('Publication', PublicationSchema)