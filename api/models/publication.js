var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PublicationSchema = new Schema({
  title: String,
  release_date: { type: Date, default: Date.now, required: true },
  publisher: String,
  format: ['book', 'LP', 'casette'],
  embed_url: String,
  description: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  published: { type: Boolean, default: false },
  project_ids: [],
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
});

module.exports = mongoose.model('Publication', PublicationSchema);