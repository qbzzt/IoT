-- Configuration parameters, your values will probably vary
ssid = "pomeranch"
wifi_pwd = "<<redacted>>"
openwhisk_url = "https://service.us.apiconnect.ibmcloud.com" .. 
    "/gws/apigateway/api/ec74d9ee76d47d2a5f9c4dbae2510b0b8a" .. 
    "e5912b542df3e2d6c8308843e70d59/smartlock/lock_query_2" ..
    "?chip=" .. node.chipid()
lock_pin = 2   -- The GPIO pin connected to the lock
wait_time = 1  -- How long to wait until we ask OpenWhisk again


-- Get an HTTPS response. 
-- According to the docs, http.get should support https URLs. However, I couldn't
-- get that working.
function getHttpsResponse(url, cb) 
  host, path = string.match(url, "https://([^/]+)/(.+)")

  conn = tls.createConnection()

  -- Don't send the request before we are connected
  conn:on("connection", function(sck, c)
    req = "GET /" .. path .. [[ HTTP/1.1
      Host: ]] .. host .. "\r\n" .. [[ 
      Connection: close
      Accept: */*]] .. "\r\n\r\n"      
    sck:send(req)
  end)  -- of conn:on("connection") callback

  conn:on("receive", function(sck, c) 
    resp = string.match(c, ".+\r\n\r\n(.+)")
    decoder = sjson.decoder({})
    decoder:write(resp)
    cb(decoder:result())
  end)   -- coon:on("receive") callback

  
  conn:connect(443,host);  
end   -- of getHttpsResponse



-- Call OpenWhisk, and open or close the lock based on 
-- the response
function openOrCloseLock()
  getHttpsResponse(openwhisk_url, 
      function(t)
        print(t.open)
        if (t.open) then
          gpio.write(lock_pin, 1)
        else
          gpio.write(lock_pin, 0)
        end   -- if then else

        -- Call again in wait_time seconds
        tmr.create():alarm(wait_time*1000, 
            tmr.ALARM_SINGLE, openOrCloseLock)
      end)   -- getHttpsResponce callback
end -- openOrCloseLock



-- There's no point doing anything until we get an IP address
-- from the access point
wifi.eventmon.register(wifi.eventmon.STA_GOT_IP, function(t)
  openOrCloseLock() 
end)   -- WiFi connected function


-- Actually connect
wifi.setmode(wifi.STATION)
wifi.sta.config({
  ssid = ssid,
  pwd = wifi_pwd
})
    

gpio.mode(lock_pin, gpio.OUTPUT)


