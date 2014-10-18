/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Blpapi = require('./blpapi.model');

exports.register = function(socket) {
  Blpapi.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Blpapi.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('blpapi:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('blpapi:remove', doc);
}