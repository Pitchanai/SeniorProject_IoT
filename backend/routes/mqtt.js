var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var cors = require('cors');

var crypto = require('crypto');
var request = require('request');

var User = require('../models/user');
var MqttAccount = require('../models/mqtt_user');
var MqttAcl = require('../models/mqtt_acl');

router.use(cors())

router.post('/signin', function(req, res) {
    MqttAccount.findOne({
        username: req.body.username
    }, function(err, usr) {
        if (err) throw err;
        if (!usr) {
            res.status(401).send({success: false, msg: 'User not found.'});
        } else {
            usr.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    var token = jwt.sign(usr.toJSON(), config.secretMqtt, {expiresIn: 3600});
                    res.setHeader("Access-Control-Allow-Origin", "*");
                    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                    res.json({success: true, token: 'JWT ' + token});
                } else {
                    res.json({success: false})
                }
            })
        }
    })
})

module.exports = router;