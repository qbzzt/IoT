load('api_gpio.js');
load('api_timer.js');

let D = [16, 5, 4, 0, 2, 14, 12, 13, 15];

GPIO.set_mode(D[2], GPIO.MODE_OUTPUT);


// Call every second to toggle the 
Timer.set(1000, true, function() {
  GPIO.toggle(D[2]);
}, null);

