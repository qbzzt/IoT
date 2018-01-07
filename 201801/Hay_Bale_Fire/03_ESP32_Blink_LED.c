const int ledPin = 3;

void setup() {
  // put your setup code here, to run once:
    pinMode (ledPin, OUTPUT);

}

void loop() {
  // put your main code here, to run repeatedly:

  // On for a second
  digitalWrite (ledPin, HIGH);  
  delay(1000); 

  // Off for half a second
  digitalWrite (ledPin, LOW); 
  delay(500); 
}
