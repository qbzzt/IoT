-- Device configuration
dht11pin = 1
updateFreq = 60    -- in seconds

-- WiFi configuration
wifiConf = {
    ssid = "barn-net"
}


-- Actually connect
wifi.setmode(wifi.STATION)
wifi.sta.config({
  ssid = wifiConf.ssid
})


function requestUrl(path)
  http.get("http://10.0.0.1/" .. path, nil, 
  function(code, data)
    print("Got response to " .. path ":" code )
  end)
end


function sendResult(temp, humidity) 
   requestUrl("/" .. node.chipid() .. "/" .. temp .. "/" .. humidity);
end


function readSensor()
    status, temp, humidity = dht.read11(dht11pin)

    if (status ~= dht.ERROR_TIMEOUT) then
        sendResult(temp, humidity)    
    end
end



sensorTimer = tmr.create()
sensorTimer:register(updateFreq * 1000, tmr.ALARM_AUTO, readSensor)
sensorTimer:start()
