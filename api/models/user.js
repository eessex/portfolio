var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  name_first: String,
  name_last: String,
  email: String,
  password: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

UserSchema.pre('save', next => {
  now = new Date();
  if(!this.created_at) {
    this.created_at = now;
  }
  this.updated_at = now;
  next();
});

module.exports = mongoose.model('User', UserSchema);