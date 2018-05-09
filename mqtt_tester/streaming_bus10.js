var mqtt = require('mqtt');
var csvtojson = require('csvtojson');

// MQTT Setup
const mqtt_user = ''
const mqtt_pass = ''
const mqtt_topic = ''
var client = mqtt.connect('mqtt://mqtt.vehicleon.cloud:1883', {username: mqtt_user, password: mqtt_pass})

const streamDataPath = './Bus10_Line1_Round1.csv'

client.on('connect', function() {
    const topic = 'Test2/Popbus10/'
    message = 0
    data_length = 0
    stream_data = []
    import_success = false
    temperature = 30

    csvtojson()
    .fromFile(streamDataPath)
    .on('json',(jsonObj)=>{
        stream_data.push(jsonObj)
    })
    .on('done',(error)=>{
        console.log('import csv success!')
        import_success = true
        data_length = stream_data.length

    })
    setInterval(() => {
        if(import_success) {
            client.publish(mqtt_topic+'Gps', stream_data[message].latitude+','+stream_data[message].longtitude)
            client.publish(mqtt_topic+'Temperature', parseFloat((Math.random()*10)+25).toFixed(2))
            client.publish(mqtt_topic+'Accelerator', parseFloat(Math.random()*15).toFixed(2))
            message++
            if (message >= data_length) message = 0
        }
    }, 1000)
})