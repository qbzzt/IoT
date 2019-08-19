-- Device configuration
dht11pin = 1
updateFreq = 60    -- in seconds

-- WiFi configuration
wifiConf = {
    ssid = "pomeranch",
    passwd = <<redacted>>
}

-- IoT Platform configuration
iotPlatformCred = {
    orgID = <<redacted>>,
    devType = "Hay-Sensor",
    devID = node.chipid(),
    authMethod = "use-token-auth",
    authToken = <<redacted>>
}


hostname = string.format("%s.messaging.internetofthings.ibmcloud.com",
    iotPlatformCred.orgID)

url = string.format("https://%s:8883/api/v0002/device/types/%s/devices/%d/events/sensorReading",
   hostname, iotPlatformCred.devType, iotPlatformCred.devID)

httpHeaders = 
    "Content-Type: application/json\r\n" .. 
    "Authorization: Basic " ..
        encoder.toBase64(iotPlatformCred.authMethod .. ":" ..
                         iotPlatformCred.authToken) .. "\r\n"


-- Actually connect
wifi.setmode(wifi.STATION)
wifi.sta.config({
  ssid = wifiConf.ssid,
  pwd = wifiConf.passwd,
})


function httpSend(jsonMsg) 
    print(jsonMsg)
    http.post(url, httpHeaders, jsonMsg, 
        function(code, data)
            print(code, data)
        end
    )
    
end
    

function sendResult(temp, humidity)
    print(string.format("Temp: %2.1fC, humidity %2.1f%%",
        temp, humidity))
    jsonMsg = [[{"temp": ]] .. temp .. 
        [[, "humidity": ]] .. humidity .. [[}
        
        ]]
    httpSend(jsonMsg);
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
