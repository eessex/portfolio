var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VideoSchema = new Schema({
  title: String,
  embed_url: String,
  description: String,
  release_date: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  published: { type: Boolean, default: false }
  // related exhibition/event/project
});

module.exports = mongoose.model('Video', VideoSchema);