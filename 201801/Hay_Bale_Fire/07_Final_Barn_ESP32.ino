#include <SPI.h>
#include <LoRa.h>

#include "WiFi.h"

typedef struct spi_pins {
  int sck;
  int miso;
  int mosi;
  int ss;
  int rst;  
  int irq;
};


const spi_pins LORA_SPI_PINS = {.sck=5, .miso=19, .mosi=27, .ss=18, .rst=14, .irq=26};

const int MHz = 1000*1000;


// The HTTP server for messages
WiFiServer server(80);


void setupLoRa() {
  SPI.begin(LORA_SPI_PINS.sck, LORA_SPI_PINS.miso, LORA_SPI_PINS.mosi, LORA_SPI_PINS.ss);
  LoRa.setPins(LORA_SPI_PINS.ss, LORA_SPI_PINS.rst, LORA_SPI_PINS.irq);

  // US Frequency, use 866*MHz in Europe
  if (!LoRa.begin(915*MHz)) 
    while (1)
      ;
  

  // Network configuration. Use the slowest speed and 
  // highest redundancy. This gives us the maximum possible
  // range.
  LoRa.enableCrc();
  LoRa.setCodingRate4(8);
  LoRa.setSpreadingFactor(12);

  // The sync word determines which frequencies will be used
  // when. If it is a value that isn't in common use (the 
  // common values are 0x12 and 0x34), it reduces the chance
  // of interference.
  LoRa.setSyncWord(0x24);  
}


void sendLoRa(String message) {
  int success;
  
  LoRa.beginPacket();
  LoRa.print(message);
  success = LoRa.endPacket();

  Serial.printf("LoRa sending on %s, status: %d\n", message.c_str(), success);
}


void setup() {
  Serial.begin(115200);

  // Be an access point
  WiFi.mode(WIFI_AP);

  // SSID of barn-net, accept up to fifteen different stations
  WiFi.softAP("barn-net", NULL, 1, 0, 15);

  // Access point IP, default gateway IP, and net mask
  WiFi.softAPConfig(IPAddress(10,0,0,1), IPAddress(10,0,0,1), IPAddress(255,0,0,0));

  // Begin the HTTP server
  server.begin();

  // Setup the LoRa radio
  setupLoRa();
}



// Read a word from the client connection
String readWord(WiFiClient clientConn) {
  char ch = '!';   
  String retVal = "";

  while (clientConn.connected() && clientConn.available() && ch != ' ') {
    ch = clientConn.read();
    if (ch != ' ') 
      retVal += ch;
  }

  return retVal;  
}


// Check if the reading you got is legitimate or some kind of error
boolean checkReading(String reading) {
  int a, b, c;
  int results;

  // A legitimate reading is three decimal numbers, each preceeded by a slash.
  results = sscanf(reading.c_str(), "/%d/%d/%d", &a, &b, &c);


  Serial.printf("Result of sscanf: %d\n", results);

  return results == 3;
}


void handleHTTP(WiFiClient clientConn) {
  String path;
    
  Serial.println("Got a client connection");
    
  readWord(clientConn);

  path = readWord(clientConn);

  Serial.printf("Message: %s\n", path.c_str());
  
  if (checkReading(path))
    clientConn.print("Good");  
  else
    clientConn.print("Bad");  

  delay(1000);
  clientConn.stop();

  // Sending the LoRa has to be the last thing otherwise
  // when we try to debug with a browser we get a timeout.
  if (checkReading(path))    
    sendLoRa(path);
}


void loop() {  
  WiFiClient clientConn = server.available();  

  if (clientConn)
    handleHTTP(clientConn);
    
}
