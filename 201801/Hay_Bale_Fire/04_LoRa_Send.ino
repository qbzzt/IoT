
// Based on the tutorial at https://robotzero.one/heltec-wifi-lora-32/

#include <SPI.h>
#include <LoRa.h>

const int builtInLED = 25;

typedef struct spi_pins {
  int sck;
  int miso;
  int mosi;
  int cs;
  int rst;  
  int irq;
};


const spi_pins LORA_SPI_PINS = {.sck=5, .miso=19, .mosi=27, .cs=18, .rst=14, .irq=26};

const int MHz = 1000*1000;

void setup() {

  pinMode(builtInLED, OUTPUT);
  
  SPI.begin(LORA_SPI_PINS.sck, LORA_SPI_PINS.miso, LORA_SPI_PINS.mosi, LORA_SPI_PINS.cs);
  LoRa.setPins(LORA_SPI_PINS.cs, LORA_SPI_PINS.rst, LORA_SPI_PINS.irq);

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
  int sendingRetVal;
  LoRa.beginPacket();
  LoRa.printf("Hello");
  
  sendingRetVal = LoRa.endPacket();
  
  Serial.printf("Sending success: %d\n", sendingRetVal );


  if (sendingRetVal) {
    // Short pulse to show the message was sent
    digitalWrite(builtInLED, HIGH);  
    delay(100); 
    digitalWrite(builtInLED, LOW); 
  }

  delay(1000);
}
