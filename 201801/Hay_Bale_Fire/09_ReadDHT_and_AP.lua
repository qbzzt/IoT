wifi.setmode(wifi.SOFTAP)
result = wifi.ap.config({
    ssid = "HayBarn"
})

if (result == false) then
        print("wifi.ap.config failed") 
end

if result then 
    result =
        wifi.ap.setip({
        ip =
        "172.31.0.1",
        netmask =
        "255.255.0.0"
    })
    if (result == false)
        then print("wifi.ap.setip failed") end
end

if result then 
    result =
        wifi.ap.dhcp.start()
    if (result == false)
        then 
        print("wifi.ap.dhcp.start failed") 
    end
end



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
