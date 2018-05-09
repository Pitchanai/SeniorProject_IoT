var mongoClient = require('mongodb').MongoClient;
var mqtt = require('mqtt');
var assert = require('assert');
var moment = require('moment');
var config = require('./config/database');

var url = config.database;
var client = mqtt.connect('mqtt://161.200.92.19:1883', {username: config.mqtt_user, password: config.mqtt_pass});
client.on('connect', function () {
    client.subscribe('Chulalongkorn/#')
});

mongoClient.connect(url, function(err, db) {
    var col = db.collection('Data');
    var bulk = col.initializeOrderedBulkOp();
    client.on('message', function(topic, payload) {
        console.log(topic);
        console.log(payload.toString('utf8'));
        topic = topic.split("/");
        if (topic[2]=='Status') {
            console.log(payload.toString('utf8') + " " + moment().valueOf()/1000);
            let msg = payload.toString('utf8').split(' ');
            let delay = parseFloat(moment().valueOf()/1000) - parseFloat(msg[2])
            console.log("Delay : " + delay)
        }
        if (topic[2]=='Latitude') {
            var msg = payload.toString('utf8').split(',');
            bulk.insert({
                topic: topic,
                latitude: parseFloat(msg[0]),
                longtitude: parseFloat(msg[1]),
                status: msg[2],
                time: msg[3],
                unix_time_snd: parseFloat(msg[4]),
                unix_time_rcv: parseFloat(moment().valueOf()/1000),
                delay: parseFloat(moment().valueOf()/1000) - parseFloat(msg[4])
            });
        }
    });
    setInterval(function() {
        if (bulk.length > 0) {
            bulk.execute(function(err, result) {});
            bulk = col.initializeOrderedBulkOp();
        }
    }, 10);
});

