#include <SPI.h>
#include <LoRa.h>

const int builtInLED = 25;

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

void setup() {

  pinMode(builtInLED, OUTPUT);
  
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

void loop() {
  int sendSuccess;
  static int counter = 0;
  
  LoRa.beginPacket();
  LoRa.printf("Hello #%d", counter++);
  
  sendSuccess = LoRa.endPacket();
  
  if (sendSuccess) {
    // Short pulse to show the message was sent
    digitalWrite(builtInLED, HIGH);  
    delay(100); 
    digitalWrite(builtInLED, LOW); 
    delay(900); 
  } else
    delay(1000);
}
