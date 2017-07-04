pin = 2
gpio.mode(pin, gpio.OUTPUT)

wifi.setmode(wifi.SOFTAP, false)


result = wifi.ap.config({
    ssid="Smartlock",
    save=false
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
  if path == "/on" then
    gpio.write(pin, 1)
    return "Turn on"
  end

  if path == "/off" then
    gpio.write(pin, 0)
    return "Turn off"
  end

  return "Confused"
end

httpServer = net.createServer(net.TCP)
httpServer:listen(80, function(conn) 
   conn:on("receive", function(conn, payload)
      print(payload)
      path = string.match(payload, "%s+(%S+)%s+")
      resp = httpResponse(path)
      conn:send("<h1>" .. resp .. "</h1>")
   end)  -- Of the conn:on function
end)   -- of the httpServer:listen function
