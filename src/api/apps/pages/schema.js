var mongoose = require('mongoose')
var Schema = mongoose.Schema
var slug = require('mongoose-slug-generator')

mongoose.plugin(slug)

var PageSchema = new Schema({
  title: String,
  description: String,
  lead_text: String,
  slug: {
    type: String,
    slug: ['title'],
    slug_padding_size: 2,
    unique: true
  },
  images: { type: Array, default: [] },
  embed_codes: [],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  published: { type: Boolean, default: false }
})

module.exports = mongoose.model('Page', PageSchema)
