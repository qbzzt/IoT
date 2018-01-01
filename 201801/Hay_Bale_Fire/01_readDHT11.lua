status, temp, humi = dht.read11(1)

if status == dht.ERROR_TIMEOUT then
   print("DHT timed out, is it connected correctly?")
else
    if status == dht.ERROR_CHECKSUM then
        print("Checksum error, results probably valid")
   end
   print(string.format("Relative humidify:%4.2f %%\r\n", humi));
   print(string.format("Temp: %4.2fC = %4.2fF\r\n",
    temp, temp*5/9+32))
end

