var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MqttAcl= new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    clientid: {
        type: String
    },
    publish: {
        type: Array
    },
    subscribe: {
        type: Array
    },
    pubsub: {
        type: Array
    }
});

module.exports = mongoose.model('MqttAcl', MqttAcl);