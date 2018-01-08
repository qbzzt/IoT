const int builtInLED = 25;

void setup() {
  // put your setup code here, to run once:
    pinMode(builtInLED, OUTPUT);

}

void loop() {
  // put your main code here, to run repeatedly:

  // On for a second
  digitalWrite(builtInLED, HIGH);  
  delay(1000); 

  // Off for half a second
  digitalWrite(builtInLED, LOW); 
  delay(500); 
}
