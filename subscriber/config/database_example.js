/*
 *  FILL VALUE IN BELOW VARIABLE AND CHANGE FILE NAME TO "database.js" 
 */

// MONGODB
const mongo_user = ''
const mongo_pass = ''
const mongo_url  = '' // 127.0.0.1
const mongo_port = '' // 27017
const mongo_database = ''
const mongo_auth_database = '' // admin

// MONGODB Test
const mongo_test_user = ''
const mongo_test_pass = ''
const mongo_test_url  = '' // 127.0.0.1
const mongo_test_port = '' // 27017
const mongo_test_database = ''
const mongo_test_auth_database = '' // admin

// MQTT
const mqtt_user = ''
const mqtt_pass = ''

// MQTT Test
const mqtt_test_user = ''
const mqtt_test_pass = ''

module.exports = {
    'database':'mongodb://' + mongo_user + ':' + mongo_pass + '@' + mongo_url + ':' + mongo_port + '/' + mongo_database + '?authMechanism=SCRAM-SHA-1&authSource=' + mongo_auth_database,
    'database_test':'mongodb://' + mongo_test_user + ':' + mongo_test_pass + '@' + mongo_test_url + ':' + mongo_test_port + '/' + mongo_test_database + '?authMechanism=SCRAM-SHA-1&authSource=' + mongo_test_auth_database,
    'mqtt_user': mqtt_user,
    'mqtt_pass': mqtt_pass,
    'mqtt_test_user' : mqtt_test_user,
    'mqtt_test_pass' : mqtt_test_pass
}