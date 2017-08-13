var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 7;

var UserSchema = new Schema({
  name_first: String,
  name_last: String,
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true},
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

UserSchema.pre('save', function(next) {
  var user = this;
  var now = new Date();
  if(!user.created_at) {
    user.created_at = now;
    next();
  }
  user.updated_at = now;

  if (!user.isModified('password')) return next();
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });

});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  console.log(candidatePassword)
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    console.log(err)
    console.log(isMatch)
      if (err) return cb(err);
      cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema);