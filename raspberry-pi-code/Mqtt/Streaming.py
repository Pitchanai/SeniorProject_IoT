import time
import datetime
import serial
import paho.mqtt.client as mqtt

accountFile = open("Mqtt/account.txt", "r")
accountInfo = accountFile.readline()
accountInfo = accountInfo.split(",")

#MQTT
userID = accountInfo[0]
password = accountInfo[1]
host = "mqtt.vehicleon.cloud" #Chula IP
port = 8883

#Datetime
pattern = '%d.%m.%Y.%H.%M.%S'

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
        #client._max_queued_messages = 10
        #client._reconnect_max_delay = 1
        client.username_pw_set(userID, password)
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

def gpsConverter(gps, direction):
    dataA = gps[0:len(gps)-7]
    dataB = gps[len(gps)-7:len(gps)]
    dataB = float(dataB)
    dataB = dataB/60
    dataA = float(dataA)
    data = dataA+dataB
    if direction=='S' or direction=='W' :
        data = -data
    format(data, '.6f')
    return format(data, '.6f')

ser = serial.Serial(
        port = '/dev/serial0',
        baudrate = 9600,
        parity = serial.PARITY_NONE,
        stopbits = serial.STOPBITS_ONE,
        bytesize = serial.EIGHTBITS,
        timeout = 1
)

counter = 0
while True:
    x = ser.readline()
    gpsRaw = x.split(',')
    # 0 = gpsType (prefer $GPRMC)
    # 1 = time
    # 2 = status (A Active)
    # 3 = latitude
    # 4 = North +, South -
    # 5 = longtitude
    # 6 = East +, West -
    # 7 = Speed in knots
    # 8 = True course
    # 9 = Date
    # 10= Viriation
    status = "Running " + str(counter)
    counter += 1
    rc = client.publish("Chulalongkorn/Pop01/Status", status + " " + str(time.time()), 0)
    print("Send " + status + " : " + str(rc))

    if (gpsRaw[0] == '$GPRMC' and gpsRaw[2] == 'A'):
        dt = gpsRaw[9][0:2]+'.'+gpsRaw[9][2:4]+'.20'+gpsRaw[9][4:6]+'.'+gpsRaw[1][0:2]+'.'+gpsRaw[1][2:4]+'.'+gpsRaw[1][4:6]
        epoch = int(time.mktime(time.strptime(dt, pattern))) + 25200
        msg = gpsConverter(gpsRaw[3], gpsRaw[4]) + "," + gpsConverter(gpsRaw[5], gpsRaw[6]) +  "," + gpsRaw[2] + "," + gpsRaw[1] + "," + str(epoch)
        #print(msg)
        client.publish(accountInfo[2]+"Latitude", msg, 0)

