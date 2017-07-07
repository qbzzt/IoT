pin = 2
gpio.mode(pin, gpio.OUTPUT)

wifi.setmode(wifi.SOFTAP)


result = wifi.ap.config({
    ssid="Smartlock"
})

if (result == false) then print("wifi.ap.config failed") end

if result then 
    result = wifi.ap.setip({
        ip = "172.31.0.1",
        netmask = "255.255.0.0"
    })
    if (result == false) then print("wifi.ap.setip failed") end
end

if result then 
    result = wifi.ap.dhcp.start()
    if result == false then print("wifi.ap.dhcp.start failed") end
end


function auth(newKey) 
  local oldKey
  local keyNum
  
  fd = file.open("authkey", "r"); oldKey = fd:read(); fd:close()
  fd = file.open("keynum", "r"); keyNum = fd:read(); fd:close()

  if (oldKey == crypto.toBase64(crypto.hash("sha1", newKey))) then
    -- Authentication successful
    fd = file.open("authkey", "w+"); fd:write(newKey); fd:close()    
    fd = file.open("keynum", "w+"); fd:write(keyNum-1); fd:close()    
    return true
  else
    return false
  end
end    



function httpResponse(path)
  local authCode

  authCode = string.match(path, "/on%?key=(%S+)")

  print (authCode)
  
  if auth(authCode) then
    local timer
    gpio.write(pin, 1)
    timer = tmr.create()

    timer:register(10*1000, tmr.ALARM_SINGLE,   -- it will unregister automatically 
        function (t) gpio.write(pin, 0) end)
    timer:start()    
    return "<h1>Lock opened for ten seconds</h1>"
  end

  -- If we got here, it means that the authorization
  -- key exists, but is incorrect
  if authCode then
    return "<h1>Bad authorization key</h1>"
  end

  -- If we got here, there is no authorization key.
  -- return the form
  return "<h1>Confused</h1>"
end

httpServer = net.createServer(net.TCP)
httpServer:listen(80, function(conn) 
   conn:on("receive", function(conn, payload)
      print(payload)
      path = string.match(payload, "%s+(%S+)%s+")
      resp = httpResponse(path)
      print(resp)
      conn:send(resp)
   end)  -- Of the conn:on function
end)   -- of the httpServer:listen function
