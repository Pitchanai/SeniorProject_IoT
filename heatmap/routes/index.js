var express = require('express');
var assert = require('assert');
var mongoose = require('mongoose');
var router = express.Router();

/* MongoDB Setup */
const mongo_user = ''
const mongo_pass = ''
const mongo_url = 'mongodb://' + mongo_user + ':' + mongo_pass + '@161.200.92.19:27017/?authMechanism=SCRAM-SHA-1&authSource=admin';

mongoose.connect(mongo_url);
var iotSchema = new mongoose.Schema({
  topic: [String],
  latitude: Number,
  longtitude: Number,
  status: String,
  time: String
}, ({collection: 'Data'}));

var iotModel = mongoose.model('iotModel', iotSchema);

/* GET home page. */
router.get('/', function(req, res, next) {
  var parseLocation = [];
  iotModel.find({}, function(err, result) {
    for (var i = 0; i < result.length; i++) {
      parseLocation.push([result[i].latitude, result[i].longtitude]);
    }
    res.render('index', {parseLocation: parseLocation});
  });
});

module.exports = router;
