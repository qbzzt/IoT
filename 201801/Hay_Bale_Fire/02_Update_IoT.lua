-- Device configuration
dht11pin = 1
updateFreq = 60    -- in seconds

-- WiFi configuration
wifiConf = {
    ssid = "Ori",
    passwd = "<<<redacted>>>"
}

-- IoT Platform configuration
iotPlatformCred = {
    orgID = "kpzxgd",
    devType = "Hay-Sensor",
    devID = node.chipid(),
    authMethod = "use-token-auth",
    authToken = "<<<redacted>>>"
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


function mqttSend(msg)
    
    mqttClient:connect(mqttConf.hostname, mqttConf.port, 
        function(client) 
            client:publish(mqttConf.eventTopic, 
                msg, 0, 0, 
                function(client) 
                    -- We do not need the connection anymore, remove it from the client
                    mqttClient:close(); 
                end
            )    -- End of client:publish
        end,
        function(client, reason)
            print("MQTT client connection failed. Reason:" .. 
                reason)
        end)  -- end of mqttClient:connect
end



function sendResult(temp, humidity) 
    jsonMsg = [[ {
        "temp": ]] .. temp .. [[, 
        "humidity": ]] .. humidity .. [[
        } ]]
   mqttSend(jsonMsg) 
end


function readSensor()
    status, temp, humidity = dht.read11(dht11pin)

    if (status ~= dht.ERROR_TIMEOUT) then
        sendResult(temp, humidity)    
    end
end



sensorTimer = tmr.create()
sensorTimer:register(updateFreq * 1000, tmr.ALARM_AUTO,
    function() readSensor() end)
sensorTimer:start()
