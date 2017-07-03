pin = 2
pinVal = 1
gpio.mode(pin, gpio.OUTPUT)

counter = 0

timer = tmr.create()

timer:register(1000, tmr.ALARM_AUTO, 
    function (t) 
        gpio.write(pin, pinVal)
        print ("Wrote to D" .. pin .. " value " .. pinVal)
        pinVal = 1-pinVal; counter = counter + 1
        if counter == 10 then t:stop(); t:unregister() end
    end)

timer:start()
