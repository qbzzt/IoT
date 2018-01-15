#include <SPI.h>
#include <LoRa.h>

#include "WiFi.h"
#include "HTTPClient.h"


// Networking and IoT Platform configuration
const String ssid = "pomeranch";
const String password = "<<redacted>>";
const String orgID = "kpzxgd";
const String devType = "Hay-Sensor";
const char* authToken = "<<redacted>>";   // Use the same token for all the devices for simplicity.

const String hostname = orgID + ".messaging.internetofthings.ibmcloud.com";

// The URL is a format string because the sensor's chip ID varies
const String urlFormatString = "http://" + hostname + ":1883/api/v0002/device/types/Hay-Sensor/devices/%d/events/sensorReading";


const int maxPacketLength = 255;

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



void setupWiFi() {
  WiFi.begin(ssid.c_str(), password.c_str());
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
  }
  
  Serial.print("Connected to WiFi, my IP is ");
  Serial.println(WiFi.localIP());
}

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


void setup() {
   // Initialize the serial device, wait until it is available
  Serial.begin(115200);

  while (!Serial)
    ;

  setupWiFi();
  setupLoRa();

  Serial.println("Setup done");
}



void sendMessage(int chipID, int temp, int humidity) {
  HTTPClient http;
  char url[maxPacketLength];
  char msg[maxPacketLength];

  Serial.printf("Message from %d: %d[C], %d %% humidity\n", chipID, temp, humidity);

  snprintf(url, maxPacketLength, urlFormatString.c_str(), chipID); 
  snprintf(msg, maxPacketLength, "{\"temp\": %d, \"humidity\": %d}", temp, humidity);

  http.begin(url);

  Serial.printf("URL: %s\n", url);
  
  http.addHeader("Content-Type", "application/json");
  http.setAuthorization("use-token-auth", authToken);
  int httpCode = http.POST(msg);

  Serial.printf("HTTP response code: %d\n", httpCode);
}





void processLoRaPacket(int packetSize) {
  char packet[maxPacketLength+1]; 
  int i;
  int chipID, temp, humidity;
  int handlingTime = millis();

  Serial.println("Got a LoRa message");

  // Read packet 
  for(i=0; i<maxPacketLength && LoRa.available(); i++)
    packet[i] = LoRa.read();

  // Make sure the packet is zero terminated
  packet[i] = 0;  

  // Parse the packet and send it onward.
  sscanf(packet, "/%d/%d/%d", &chipID, &temp, &humidity);
  sendMessage(chipID, temp, humidity);

  Serial.printf("It took %d [msec] to relay this message\n", millis()-handlingTime);
}

void loop() {
  int packetSize;
  
  delay(50);

  packetSize = LoRa.parsePacket();

  if (packetSize)
    processLoRaPacket(packetSize);
}
