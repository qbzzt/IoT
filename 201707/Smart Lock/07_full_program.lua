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

function httpResponse(path)
  local timer

  if path == "/on" then
    gpio.write(pin, 1)
    timer = tmr.create()

    timer:register(10*1000, tmr.ALARM_SINGLE,   -- it will unregister automatically 
        function (t) gpio.write(pin, 0) end)
    timer:start()    
    return "<h1>Lock opened for ten seconds</h1>"
  end

  return "Confused"
end

httpServer = net.createServer(net.TCP)
httpServer:listen(80, function(conn) 
   conn:on("receive", function(conn, payload)
      print(payload)
      path = string.match(payload, "%s+(%S+)%s+")
      resp = httpResponse(path)
      conn:send(resp)
   end)  -- Of the conn:on function
end)   -- of the httpServer:listen function
