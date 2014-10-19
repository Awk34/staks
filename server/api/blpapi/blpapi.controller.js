'use strict';

var _ = require('lodash');
var Blpapi = require('./blpapi.model');
var count = 0;

var blpapi = require('blpapi');

// Add 'authenticationOptions' key to session options if necessary.
var session = new blpapi.Session({ serverHost: '10.8.8.1', serverPort: 8194 });
var service_refdata = 1; // Unique identifier for refdata service

var responders = [];

session.start();
session.on('SessionStarted', function(m) {
//    console.log(m);
    session.openService('//blp/refdata', service_refdata);
});
session.on('ServiceOpened', function(m) {
//    console.log(m);
    // Check to ensure the opened service is the refdata service
//    if (m.correlations[0].value == service_refdata) {
//        // Request the long-form company name for each security
//        session.request('//blp/refdata', 'ReferenceDataRequest',
//            { securities: seclist, fields: ['LONG_COMP_NAME'] }, 100);
//        // Request intraday tick data for each security, 10:30 - 14:30
//        session.request('//blp/refdata', 'HistoricalDataRequest',
//            { securities: seclist,
//                fields: ['PX_LAST', 'OPEN'],
//                startDate: "20120101",
//                endDate: "20120301",
//                periodicitySelection: "DAILY" }, 101);
//    }
});
session.on('SessionStartupFailure', function(m) {
    console.log('SessionStartupFailure', util.inspect(m));
    session.stop();
    session.destroy();
});
session.on('SessionTerminated', function(m) {
    console.log('Session Terminated');
    session.stop();
    session.destroy();
});
session.on('HistoricalDataResponse', function(m) {
//    console.log(m.data);
    var data = m.data.securityData;
    if(m.eventType === 'RESPONSE'/* && m.correlations[0].value === 101*/) {
        _.each(responders, function(responder) {
            if(responder.corellationId === m.correlations[0].value) {
                responder.res.send(data);
                _.remove(responders, function(item) {
                    if(item.security === data.security) return true;
                })
            }
        });
    }
    else {
        res.send(500);
    }
});

exports.getStock = function (req, res) {
    var security = req.url.substring(12, req.url.length);
    security = security.replace(/_/g, ' ');

    console.log(req.headers.fields);

    var fields = req.headers.fields ? JSON.parse(req.headers.fields) : ['OPEN'];
    var startDate = req.headers.startdate ? req.headers.startdate : "20140601";
    var endDate = req.headers.enddate ? req.headers.enddate : "20140901";
    var corellationId = Math.floor(Math.random()*100000);

    responders.push({ security: security, res: res, corellationId: corellationId });

    newRequest(security, fields, startDate, endDate, "DAILY", corellationId);
};

function newRequest(sec, fields, startDate, endDate, periodicitySelection, corellationId) {
    if(typeof sec !== 'string') return;
    console.log(fields);
    session.request('//blp/refdata', 'HistoricalDataRequest',
        { securities: [sec],
            fields: fields,
            startDate: startDate,
            endDate: endDate,
            periodicitySelection: periodicitySelection
        },
        corellationId); //Corellation ID
}

function newMultiRequest(secs, fields, startDate, endDate, periodicitySelection, corellationId) {
    if(typeof sec !== 'string') return;
    console.log(fields);
    session.request('//blp/refdata', 'HistoricalDataRequest',
        { securities: secs,
            fields: fields,
            startDate: startDate,
            endDate: endDate,
            periodicitySelection: periodicitySelection
        },
        corellationId); //Corellation ID
}

function handleError(res, err) {
    return res.send(500, err);
}