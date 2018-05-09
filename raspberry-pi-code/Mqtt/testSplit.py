raw = "$GPRMC,091211.000,A,1341.9387,N,10023.7608,E,0.25,315.35,281017,,,D*61"
gpsRaw = raw.split(",")
# 0 = gpsType (prefer $GPRMC)
# 1 = time
# 2 = status (A Active)
# 3 = latitude
# 4 = North +, South -
# 5 = longtitude
# 6 = East +, West -

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

if (gpsRaw[0] == "$GPRMC"):
    print(gpsConverter(gpsRaw[3], gpsRaw[4]), gpsConverter(gpsRaw[5], 'W'))
    print(gpsRaw)
