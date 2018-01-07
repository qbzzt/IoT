// Based on the tutorial at https://robotzero.one/heltec-wifi-lora-32/

#include <SPI.h>
#include <LoRa.h>


#define SS      18
#define RST     14
#define DI0     26


typedef struct spi_pins {
  int sck;
  int miso;
  int mosi;
  int cs;
  int rst;  
  int irq;
};


const spi_pins LORA_SPI_PINS = {.sck=5, .miso=19, .mosi=27, .cs=18, .rst=14, .irq=26};

const MHz = 1000*1000;

void setup() {
  
  SPI.begin(LORA_SPI_PINS.sck, LORA_SPI_PINS.miso, LORA_SPI_PINS.mosi, LORA_SPI_PINS.cs);
  LoRa.setPins(LORA_SPI_PINS.cs, LORA_SPI_PINS.14, LORA_SPI_PINS.26);

  // Initialize the serial device, wait until it is available
  Serial.begin(115200);
  while (!Serial)
    ;

  Serial.println("LoRa Receiver");

  // US Frequency, use 866*MHz in Europe
  if (!LoRa.begin(915*MHz)) {
    Serial.println("LoRa starting failed :-(");
    while (1)
      ;
  }
}

void loop() {
  LoRa.beginPacket();
  LoRa.write("Hello", 5);
  Serial.println("Ret val: %d", LoRa.endPacket());

/*
// try to parse packet
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    // received a packet
    Serial.print("Received packet '");

    // read packet
    while (LoRa.available()) {
      Serial.print((char)LoRa.read());
    }

    // print RSSI of packet
    Serial.print("' with RSSI ");
    Serial.println(LoRa.packetRssi());
  }
*/  
}
