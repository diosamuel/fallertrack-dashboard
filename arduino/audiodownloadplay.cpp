#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <SPIFFS.h>
#include "AudioFileSourceSPIFFS.h"
#include "AudioGeneratorMP3.h"
#include "AudioOutputI2S.h"

const char* ssid = "router zte link";
const char* password = "batuponari";

// MP3 HTTPS URL
const char* host = "storage.googleapis.com";
const char* url = "/fallertrack-navigation-sound/speech_1747021430119.mp3";
const int httpsPort = 443;

WiFiClientSecure client;

AudioGeneratorMP3* mp3;
AudioFileSourceSPIFFS* file;
AudioOutputI2S* out;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  Serial.println("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected.");

  // Init SPIFFS
  if (!SPIFFS.begin(true)) {
    Serial.println("SPIFFS failed!");
    return;
  }

  // Secure client setup
  client.setInsecure();  // WARNING: Insecure, skip cert check

  // Connect to host
  Serial.println("Connecting to host...");
  if (!client.connect(host, httpsPort)) {
    Serial.println("HTTPS connection failed");
    return;
  }

  // Make HTTP GET request
  client.print(String("GET ") + url + " HTTP/1.1\r\n" + "Host: " + host + "\r\n" + "Connection: close\r\n\r\n");

  // Wait for headers to end
  while (client.connected()) {
    String line = client.readStringUntil('\n');
    if (line == "\r") break;
  }

  // Open file for writing
  File f = SPIFFS.open("/downloaded.mp3", FILE_WRITE);
  if (!f) {
    Serial.println("Failed to open file for writing");
    return;
  }

  // Download and save to SPIFFS
  Serial.println("Downloading MP3...");
  int bytes = 0;
  // while (client.connected() && client.available()) {
  //   uint8_t buf[512];
  //   size_t len = client.read(buf, sizeof(buf));
  //   if (len > 0) {
  //     f.write(buf, len);
  //     bytes += len;
  //   }
  // }

  while (client.connected() || client.available()) {
    uint8_t buf[512];
    int len = client.read(buf, sizeof(buf));
    if (len > 0) {
      f.write(buf, len);
      bytes += len;
    } else {
      delay(10);  // small delay to allow data
    }
  }

  f.close();
  Serial.printf("Download complete, %d bytes\n", bytes);

  // Play it
  Serial.println("Initializing playback...");
  file = new AudioFileSourceSPIFFS("/downloaded.mp3");
  out = new AudioOutputI2S(0, AudioOutputI2S::INTERNAL_DAC);
  out->SetOutputModeMono(true);
  out->SetGain(0.5);
  // out->SetPinout(25, -1, -1);  // GPIO 25 as DAC out

  mp3 = new AudioGeneratorMP3();
  mp3->begin(file, out);
  Serial.println("Playback started.");
}

void loop() {
  if (mp3 && mp3->isRunning()) {
    mp3->loop();
  } else {
    Serial.println("Playback finished or stopped.");
    delay(5000); // Avoid tight loop
  }
}