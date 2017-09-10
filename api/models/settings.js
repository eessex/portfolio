var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SettingsSchema = new Schema({
  title: String,
  description: String,
  about: {
    description: String,
    social: {
      twitter: String,
      instagram: String,
      facebook: String,
      soundcloud: String
    },
    images: [
      {
        title: { type: String },
        url: { type: String },
        aspect: { type: Number }
      }
    ]
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', SettingsSchema);