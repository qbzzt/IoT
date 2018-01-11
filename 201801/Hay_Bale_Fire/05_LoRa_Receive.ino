#include <SPI.h>
#include <LoRa.h>

const int builtInLED = 25;
const int maxPacketLength = 255;

typedef struct spi_pins {
  int sck;
  int miso;
  int mosi;
  int ss;
  int rst;
  int irq;
};


const spi_pins LORA_SPI_PINS = {.sck = 5, .miso = 19, .mosi = 27, .ss = 18, .rst = 14, .irq = 26};

const int MHz = 1000 * 1000;


void setup() {

  pinMode(builtInLED, OUTPUT);

  SPI.begin(LORA_SPI_PINS.sck, LORA_SPI_PINS.miso, LORA_SPI_PINS.mosi, LORA_SPI_PINS.ss);
  LoRa.setPins(LORA_SPI_PINS.ss, LORA_SPI_PINS.rst, LORA_SPI_PINS.irq);

  // Initialize the serial device, wait until it is available
  Serial.begin(115200);

  while (!Serial)
    ;

  Serial.println("LoRa Receiver");

  // US Frequency, use 866*MHz in Europe
  if (!LoRa.begin(915 * MHz)) {
    Serial.println("LoRa starting failed :-(");
    while (1)
      ;
  }


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






void loop() {
  int packetSize;
  static unsigned long lastPacketTime = millis();
  unsigned char packet[maxPacketLength+1]; 
  int i;

  delay(50);
  
  packetSize = LoRa.parsePacket();
  if (packetSize) {   // If there's a packet
    Serial.printf("Received packet (after %4.2f seconds): ", 
      (millis()-lastPacketTime)/1000.0);
      
    lastPacketTime = millis();

    // Read packet 
    for(i=0; i<maxPacketLength && LoRa.available(); i++)
      packet[i] = LoRa.read();

    // Make sure the packet is zero terminated
    packet[i] = 0;

    // Print packet and data
    Serial.printf("%s, with RSSI %d and S/N ratio %4.2f\n", 
      packet, LoRa.packetRssi(), LoRa.packetSnr());
   
    // Flash for half a second to show you received a packet
    digitalWrite(builtInLED, HIGH);
    delay(500);
    digitalWrite(builtInLED, LOW);
  }

}
