var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WorkSchema = new Schema({
  title: String,
  medium: String,
  dimensions: String,
  date: { type: Date, default: Date.now },
  description: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  published: { type: Boolean, default: false },
  images: [
    {
      title: { type: String },
      url: { type: String },
    }
  ]
  // related project /exhibition history
});

module.exports = mongoose.model('Work', WorkSchema);