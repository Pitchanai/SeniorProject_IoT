/*
 *  FILL VALUE IN BELOW VARIABLE AND CHANGE FILE NAME TO "database.js" 
 */

// JWT API Secret
const api_secret = ''

// JWT MQTT Secret
const mqtt_secret = ''

// MONGODB
const mongo_user = ''
const mongo_pass = ''
const mongo_url  = '' // 127.0.0.1
const mongo_port = '' // 27017
const mongo_database = ''
const mongo_auth_database = '' // admin

// EMQTT
const emqtt_user = ''
const emqtt_pass = ''

module.exports = {
    'secret': api_secret,
    'secretMqtt': mqtt_secret,
    'database':'mongodb://' + mongo_user + ':' + mongo_pass + '@' + mongo_url + ':' + mongo_port + '/' + mongo_database + '?authMechanism=SCRAM-SHA-1&authSource=' + mongo_auth_database,
    'emqttd':'https://' + emqtt_user + ':' + emqtt_pass + '@emqtt.vehicleon.cloud/api/v2/'
}