'use strict';

var _ = require('lodash');
var Blpapi = require('./blpapi.model');
var sessionStarted = false;
var count = 0;

//var c = require('blpapi/examples/Console.js');
var blpapi = require('blpapi');

//var hp = c.getHostPort();
// Add 'authenticationOptions' key to session options if necessary.
var session = new blpapi.Session({ serverHost: '10.8.8.1', serverPort: 8194 });
var service_refdata = 1; // Unique identifier for refdata service

var seclist = ['ININ US Equity', 'VOD LN Equity'];

session.start();
sessionStarted = true;

exports.start = function(req, res) {
    session.start();
};

// Get list of blpapis
exports.index = function (req, res) {
    var data = [];

    session.on('SessionStarted', function(m) {
        console.log(m);
        sessionStarted = true;
//        session.openService('//blp/refdata', service_refdata);
    });

    session.on('ServiceOpened', function(m) {
        console.log(m);
        // Check to ensure the opened service is the refdata service
        if (m.correlations[0].value == service_refdata) {
            // Request the long-form company name for each security
            session.request('//blp/refdata', 'ReferenceDataRequest',
                { securities: seclist, fields: ['LONG_COMP_NAME'] }, 100);
            // Request intraday tick data for each security, 10:30 - 14:30
            session.request('//blp/refdata', 'HistoricalDataRequest',
                { securities: seclist,
                    fields: ['PX_LAST', 'OPEN'],
                    startDate: "20120101",
                    endDate: "20120301",
                    periodicitySelection: "DAILY" }, 101);
        }
    });

    var responses = 0;
    function checkStop() {
        responses++;
        // Signal stop once all final responses have been received
        if (responses == 2) {
            session.stop();
//            session.destroy();
            console.log('done');
//            res.end();
            res.json(data);
        }
    }

    session.on('ReferenceDataResponse', function(m) {
        console.log(m);
        // At this point, m.correlations[0].value will equal:
        // 100 -> ReferenceDataResponse for long-form company names
        if (m.correlations[0].value === 100 && m.eventType === 'RESPONSE')
            checkStop();
    });
    
    session.on('HistoricalDataResponse', function(m) {
        console.log(m);
//        res.write(m.data);
//        res.write('m.data');
        // At this point, m.correlations[0].value will equal:
        // 101 -> HistoricalDataResponse for both securities
        //
        // m.eventType == 'PARTIAL_RESPONSE' until finally
        // m.eventType == 'RESPONSE' to indicate there is no more data
        data.push(m.data);
        if (m.eventType === 'RESPONSE') {
//            data.push(m.data);
            if(m.correlations[0].value === 101) {
                checkStop();
            }
        }
    });

    session.on('SessionTerminated', function(m) {
        sessionStarted = false;
        session.destroy();
    });

//    if(!sessionStarted)
//        session.start();
    session.openService('//blp/refdata', service_refdata);

//    res.write('Starting session.');
};

// Get a single blpapi
exports.show = function (req, res) {
    Blpapi.findById(req.params.id, function (err, blpapi) {
        if (err) {
            return handleError(res, err);
        }
        if (!blpapi) {
            return res.send(404);
        }
        return res.json(blpapi);
    });
};

// Creates a new blpapi in the DB.
exports.create = function (req, res) {
    Blpapi.create(req.body, function (err, blpapi) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, blpapi);
    });
};

// Updates an existing blpapi in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Blpapi.findById(req.params.id, function (err, blpapi) {
        if (err) {
            return handleError(res, err);
        }
        if (!blpapi) {
            return res.send(404);
        }
        var updated = _.merge(blpapi, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, blpapi);
        });
    });
};

// Deletes a blpapi from the DB.
exports.destroy = function (req, res) {
    Blpapi.findById(req.params.id, function (err, blpapi) {
        if (err) {
            return handleError(res, err);
        }
        if (!blpapi) {
            return res.send(404);
        }
        blpapi.remove(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
    return res.send(500, err);
}