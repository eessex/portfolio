var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PublicationSchema = new Schema({
  artist: String,
  compilation: { type: Boolean, default: false },
  title: String,
  release_date: String,
  publisher: String,
  format: String,
  embed_url: String,
  description: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  published: { type: Boolean, default: false },
  project_ids: { type: Array, default: [] },
  images: [
    {
      title: { type: String },
      url: { type: String },
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