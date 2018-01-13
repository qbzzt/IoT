#include "WiFi.h"


// The HTTP server for messages
WiFiServer server(80);

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_AP);
  WiFi.softAP("barn-net");
  WiFi.softAPConfig(IPAddress(10,0,0,1), IPAddress(10,0,0,1), IPAddress(255,0,0,0));
  server.begin();
}



void loop() {
  WiFiClient clientConn = server.available();
  String path = "";
  char ch = '!';
  int chipID, temp, humidity;
  int retVal;

  if (clientConn) {
    // Get rid of the HTTP verb, everything until the first space
    while (clientConn.connected() && ch != ' ')
      if (clientConn.available())
        ch = clientConn.read();

    ch = '!';

    // Read the path, everything until the second space      
    while (clientConn.connected() && ch != ' ')
      if (clientConn.available()) {
        ch = clientConn.read();
        if (ch == ' ')
          path += '\0';
        else
          path += ch;
      }

    retVal = sscanf(path.c_str(), "/%d/%d/%d", &chipID, &temp, &humidity);
    if (retVal != 3) {
      Serial.print("Can't parse path ");
      Serial.println(path);

      return ;
    }
    
    Serial.printf("Chip %d : %d C, %d % relative humidity\n", chipID, temp, humidity);

    clientConn.println("HTTP/1.0 200 OK");    
    clientConn.println("Content-type:text/html");
    clientConn.println("");
    clientConn.print("<body><h2>");
    clientConn.print(path);
    clientConn.println("</h2></body>");
    clientConn.println("");

    delay(1000);

    clientConn.stop();
  }

}
