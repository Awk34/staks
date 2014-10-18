'use strict';

var _ = require('lodash');
var Blpapi = require('./blpapi.model');

//var c = require('blpapi/examples/Console.js');
//var blpapi = require('blpapi');

//var hp = c.getHostPort();
// Add 'authenticationOptions' key to session options if necessary.
//var session = new blpapi.Session({ serverHost: hp.serverHost, serverPort: hp.serverPort });
var service_refdata = 1; // Unique identifier for refdata service

var seclist = ['AAPL US Equity', 'VOD LN Equity'];
//
//session.on('SessionStarted', function(m) {
//    c.log(m);
//    session.openService('//blp/refdata', service_refdata);
//});

// Get list of blpapis
exports.index = function(req, res) {
  Blpapi.find(function (err, blpapis) {
    if(err) { return handleError(res, err); }
    return res.json(200, blpapis);
  });
};

// Get a single blpapi
exports.show = function(req, res) {
  Blpapi.findById(req.params.id, function (err, blpapi) {
    if(err) { return handleError(res, err); }
    if(!blpapi) { return res.send(404); }
    return res.json(blpapi);
  });
};

// Creates a new blpapi in the DB.
exports.create = function(req, res) {
  Blpapi.create(req.body, function(err, blpapi) {
    if(err) { return handleError(res, err); }
    return res.json(201, blpapi);
  });
};

// Updates an existing blpapi in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Blpapi.findById(req.params.id, function (err, blpapi) {
    if (err) { return handleError(res, err); }
    if(!blpapi) { return res.send(404); }
    var updated = _.merge(blpapi, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, blpapi);
    });
  });
};

// Deletes a blpapi from the DB.
exports.destroy = function(req, res) {
  Blpapi.findById(req.params.id, function (err, blpapi) {
    if(err) { return handleError(res, err); }
    if(!blpapi) { return res.send(404); }
    blpapi.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}