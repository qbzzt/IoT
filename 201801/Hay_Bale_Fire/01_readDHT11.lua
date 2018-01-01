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



