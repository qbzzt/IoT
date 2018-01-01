-- WiFi configuration
wifiConf = {
    ssid = "pomeranch",
    passwd = "<<redacted>>"
}

-- IoT Platform coniguration
iotPlatformCred = {
    orgID = "kpzxgd",
    devType = "Hay-Sensor",
    devID = node.chipid(),
    authMethod = "use-token-auth",
    authToken = "_bc!Ey6UtH3Emv64Iy"
}

mqttConf = {
    hostname = iotPlatformCred.orgID .. 
        ".messaging.internetofthings.ibmcloud.com",
    port = 1883,
    devID = "d:" .. iotPlatformCred.orgID .. ":" ..
        iotPlatformCred.devType .. ":" ..
        iotPlatformCred.devID,
    userName = iotPlatformCred.authMethod,
    password = iotPlatformCred.authToken,
    eventTopic = "iot-2/evt/sensorReading/fmt/JSON"
}



-- Actually connect
wifi.setmode(wifi.STATION)
wifi.sta.config({
  ssid = wifiConf.ssid,
  pwd = wifiConf.passwd,
})
    
mqttClient = mqtt.Client(mqttConf.devID, 0, 
    mqttConf.userName, mqttConf.password)


mqttClient:connect(mqttConf.hostname, mqttConf.port, 0, 
    function(client)
        print("connected")
  
        client:publish(mqttConf.eventTopic, 
            '{"temp": 20}', 0, 0, 
            function(client) 
                print("sent") 
            end
        )    -- End of client:publish
    end,
    function(client, reason)
        print("MQTT client connection failed. Reason:" .. reason)
    end)  -- end of mqttClient:connect

mqttClient:close();



status, temp, humi = dht.read11(1)

if status == dht.ERROR_TIMEOUT then
   print("DHT timed out, is it connected correctly?")
else
    if status == dht.ERROR_CHECKSUM then
        print("Checksum error, results probably valid")
   end
   print(string.format("Relative humidify:%2.1f%%", humi));
   print(string.format("Temp: %2.1fC = %3.1fF",
    temp, temp*9/5+32))
end




