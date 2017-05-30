var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name_first: String,
    name_last: String,
    email: String,
    password: String
});

module.exports = mongoose.model('User', UserSchema);