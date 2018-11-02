var mongoose = require('mongoose')
var Schema = mongoose.Schema
var slug = require('mongoose-slug-generator')

mongoose.plugin(slug)

var PageSchema = new Schema({
  title: String,
  description: String,
  slug: {
    type: String,
    slug: ['title'],
    slug_padding_size: 2,
    unique: true
  },
  images: { type: Array, default: [] },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  published: { type: Boolean, default: false }
})

PageSchema.pre('save', next => {
  const now = new Date()
  if (!this.created_at) {
    this.created_at = now
  }
  this.updated_at = now
  next()
})

module.exports = mongoose.model('Page', PageSchema)
