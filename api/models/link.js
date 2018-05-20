var mongoose = require('mongoose')
var Schema = mongoose.Schema

var LinkSchema = new Schema({
  title: String,
  url: String,
  author: String,
  publication: String,
  published_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  published: { type: Boolean, default: false }
  // related exhibition/event/project
})

module.exports = mongoose.model('Link', LinkSchema)
