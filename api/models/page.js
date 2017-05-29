var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PageSchema = new Schema({
    title: String
});

module.exports = mongoose.model('Page', PageSchema);