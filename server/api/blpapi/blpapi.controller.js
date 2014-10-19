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
    console.log(m);
    session.openService('//blp/refdata', service_refdata);
});
session.on('ServiceOpened', function(m) {
    console.log(m);
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
    console.log(m);
    var data = m.data.securityData;
    if(m.eventType === 'RESPONSE' && m.correlations[0].value === 101) {
        _.each(responders, function(responder) {
            console.log(responder.security +' === '+ data.security+' : '+(responder.security === data.security));
            if(responder.security === data.security) {
                responder.res.send(data);
                _.remove(responders, function(item) {
                    if(item.security === data.security) return true;
                })
            } else {
                console.log('nope');
            }
        });
    }
    else {
        res.send(500);
    }
});

exports.getStock = function (req, res) {
    var stock = req.url.substring(8, req.url.length);
    stock = stock.replace(/_/g, ' ');

    responders.push({ security: stock, res: res });

    newRequest(stock);
};

function newRequest(sec) {
    if(typeof sec !== 'string') return;
    session.request('//blp/refdata', 'HistoricalDataRequest',
        { securities: [sec],
            fields: ['PX_LAST', 'OPEN'],
            startDate: "20140101",
            endDate: "20140301",
            periodicitySelection: "DAILY" },
        101); //maxDataPoints
}

function handleError(res, err) {
    return res.send(500, err);
}