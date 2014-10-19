/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');

Thing.find({}).remove(function () {
    Thing.create({
        name: 'AngularJS'
    }, {
        name: 'D3'
    }, {
        name: 'Node.js + Express'
    }, {
        name: 'Bloomberg Public API'
    }, {
        name: 'OAuth 2.0'
    }, {
        name: 'MongoDB + Mongoose'
    }, {
        name: 'Socket.IO'
    });
});

User.find({}).remove(function () {
    User.create({
            provider: 'local',
            name: 'Test User',
            email: 'test@test.com',
            password: 'test'
        }, {
            provider: 'local',
            role: 'admin',
            name: 'Admin',
            email: 'admin@admin.com',
            password: 'adminhacks'
        }, function () {
            console.log('finished populating users');
        }
    );
});