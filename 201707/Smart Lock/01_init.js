load('api_gpio.js');

let D = [16, 5, 4, 0, 2, 14, 12, 13, 15, 3, 1];

GPIO.set_mode(D[1], GPIO.MODE_INPUT);

GPIO.set_int_handler(D[1], GPIO.INT_EDGE_ANY, 
  function() {print("D1 is now ", GPIO.read(D[1]));}, 
  null);



GPIO.enable_int(D[1]);

print ("End of init.js");
