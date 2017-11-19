var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ProjectSchema = new Schema({
  active: Boolean,
  created_at: { type: Date, default: Date.now },  
  description: String,
  embed_urls: [String],
  end_date: Date,
  images: [
    {
      aspect: { type: Number },
      title: { type: String },
      url: { type: String },
    }
  ],
  links: [
    {
      title: { type: String },
      url: { type: String },
    }
  ],
  published: { type: Boolean, default: false },  
  start_date: Date,  
  title: String,
  updated_at: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Project', ProjectSchema)
