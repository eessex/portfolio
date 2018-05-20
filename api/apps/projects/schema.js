var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ProjectSchema = new Schema({
  active: Boolean,
  created_at: { type: Date, default: Date.now },  
  description: String,
  embed_codes: [String],
  end_date: Date,
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
  published: { type: Boolean, default: false },  
  start_date: Date,  
  title: String,
  updated_at: { type: Date, default: Date.now },
  list_index: Number
})

module.exports = mongoose.model('Project', ProjectSchema)
