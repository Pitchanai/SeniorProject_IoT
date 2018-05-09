var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var cors = require('cors');
var jwtsimple = require('jwt-simple');

var crypto = require('crypto');
var request = require('request');

var User = require('../models/user');
var MqttAccount = require('../models/mqtt_user');
var MqttAcl = require('../models/mqtt_acl');

const emqtt_url = config.emqttd;

router.use(cors())

router.get('/clients', passport.authenticate('jwt', {session: false}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
        request({
            url: emqtt_url + 'nodes/emq@127.0.0.1/clients?page_size=1000',
            json: true
        }, function(error, response, body) {
            if (error) {
                return res.json({success: false});
            }
            res.json({success: true, result: body.result});
        });
    }
});

router.get('/clients/:clientid', passport.authenticate('jwt', {session: false}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
        request({
            url: emqtt_url + 'nodes/emq@127.0.0.1/clients/' + req.params.clientid,
            json: true
        }, function(error, response, body) {
            if (error) {
                return res.json({success: false});
            }
            res.json({success: true, result: body.result});
        });
    }
});

router.get('/monitoring', passport.authenticate('jwt', {session: false}), function (req, res) {
    var token = getToken(req.headers);
    if (token) {
        request({
            url: emqtt_url + 'monitoring/nodes/emq@127.0.0.1',
            json: true
        }, function(error, response, body) {
            if (error) {
                return res.json({success: false});
            }
            res.json({success: true, result: body.result});
        });
    }
})

router.get('/subscriptions', passport.authenticate('jwt', {session: false}), function (req, res) {
    var token = getToken(req.headers);
    if (token) {
        request({
            url: emqtt_url + 'nodes/emq@127.0.0.1/subscriptions?page_size=1000',
            json: true
        }, function(error, response, body) {
            if (error) {
                return res.json({success: false});
            }
            res.json({success: true, result: body.result});
        });
    }
})

getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

module.exports = router;