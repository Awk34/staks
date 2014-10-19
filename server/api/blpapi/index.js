'use strict';

var express = require('express');
var controller = require('./blpapi.controller');

var router = express.Router();

router.get('/securities/:id', controller.getStock);

module.exports = router;