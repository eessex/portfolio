var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PageSchema = new Schema({
  title: String,
  description: String,
  slug: String,
  images: Array, default: [],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  published: { type: Boolean, default: false }
});

PageSchema.pre('save', next => {
  now = new Date();
  if(!this.created_at) {
    this.created_at = now;
  }
  this.updated_at = now;
  next();
});

module.exports = mongoose.model('Page', PageSchema);