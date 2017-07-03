pin = 1
gpio.mode(pin, gpio.INT)
gpio.trig(pin, "both", 
   function(level, time)
     print(level)
   end
)

print("Connect D", pin, " to one and then zero")
