var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProjectSchema = new Schema({
  title: String,
  start_date: Date,
  end_date: Date,
  active: Boolean,
  embed_urls: [String],
  description: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  published: { type: Boolean, default: false },
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

module.exports = mongoose.model('Project', ProjectSchema);