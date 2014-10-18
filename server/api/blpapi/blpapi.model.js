'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BlpapiSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Blpapi', BlpapiSchema);