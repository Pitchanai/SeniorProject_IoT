import os, time, ssl, random
import paho.mqtt.client as mqtt

#MQTT
accountFile = open("Mqtt/account.txt", "r")
accountInfo = accountFile.readline()
accountInfo = accountInfo.split(",")

userID = accountInfo[0]
password = accountInfo[1]
host = 'mqtt.vehicleon.cloud'
port = 8883

def on_connect(client, userdata, flags, rc):
    print("Connected with flags [%s] rtn cod e[%d]" %(flags, rc))

def on_disconnect(client, userdata, rc):
    rc = client.connect(host, port, 60)
    print("Disconnected with rtn code [%d]" %(rc))

mqttConnected = True
client = None

while mqttConnected:
    try:
        client = mqtt.Client()
        client.on_connect = on_connect
        client.on_disconnect = on_disconnect
        client.username_pw_set(userID, password)
        client.tls_set("Mqtt/ca.pem")
        rc = client.connect(host, port, 60)
        client.loop_start()
        print("Connected rc : "+str(rc))
    except:
        log = open("/home/pi/Mqtt/log.txt","w")
        log.write("Client Connection Failed")
        log.close()
        print("Connection Failed")
    else:
        log = open("/home/pi/Mqtt/log.txt","w")
        log.write("Client Connected")
        log.close()
        mqttConnected = False
        print("Connected = True")

counter = 0
message_no = 0
while True:
    time.sleep(0.01)
    if (counter > 99):
        counter = 0
    getTime = str(time.time())
    if (counter == 0):
        client.publish(accountInfo[2]+"Humidity_indoor", str(time.time()) + "," + str(random.uniform(0, 100)) + "," + str(message_no))
        message_no += 1
    if (counter == 1):
        client.publish(accountInfo[2]+'Temperature_indoor', str(time.time()) + "," + str(random.uniform(0, 100)) + ',' + str(message_no))
        message_no += 1
    if (counter == 2):
        client.publish(accountInfo[2]+'Gps', '13.698757,100.395915,A,' + str(time.time()) + "," + str(time.time()) + "," + str(message_no))
        message_no += 1
    if (counter % 5 == 1):
        client.publish(accountInfo[2]+'Dust_indoor', str(time.time()) + "," + str(random.uniform(0, 100)) + ',' + str(message_no))
        message_no += 1
    if (counter % 5 == 2):
        client.publish(accountInfo[2]+'Dust_outdoor', str(time.time()) + "," + str(random.uniform(0, 100)) + ',' + str(message_no))
        message_no += 1
    if (counter == 11):
        client.publish(accountInfo[2]+'Rain', str(time.time()) + "," + str(random.uniform(0, 100)) + ',' + str(message_no))
        message_no += 1
    if (counter % 10 == 3):
        client.publish(accountInfo[2]+'Light', str(time.time()) + ',' + str(random.uniform(0, 100)) + ',' + str(message_no))
        message_no += 1
    if (counter == 13):
        client.publish(accountInfo[2]+'Humidity_outdoor', str(time.time()) + ',' + str(random.uniform(0, 100)) + ',' + str(message_no))
        message_no += 1
    if (counter == 14):
        client.publish(accountInfo[2]+'Temperature_outdoor', str(time.time()) + ',' + str(random.uniform(0, 100)) + ',' + str(message_no))
        message_no += 1
    client.publish(accountInfo[2]+'Acceleration', str(time.time()) + ',' + str(random.uniform(0, 100)) + ',' + str(message_no))
    message_no += 1
    counter += 1


## SENSORS DEVICE ##
# INDOOR
# Acceleration : 100
# Humidity Indoor : 1
# Temperature Indoor : 1
# GPS : 1
# Dust Indoor : 20
# 
# OUTDOOR
# Dust Outdoor : 20
# Rain : 1
# Light : 10
# Humidity Outdoor : 1
# Temperature Outdoor : 1