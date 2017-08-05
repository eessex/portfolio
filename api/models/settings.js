var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SettingsSchema = new Schema({
  title: String,
  description: String,
  updated_at: { type: Date, default: Date.now }
});

SettingsSchema.pre('save', next => {
  now = new Date();
  this.updated_at = now;
  next();
});

module.exports = mongoose.model('Settings', SettingsSchema);