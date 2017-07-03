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
    if (result == false) then print("wifi.ap.dhcp.start failed") end
end
