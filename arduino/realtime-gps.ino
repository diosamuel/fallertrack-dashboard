#include <TinyGPSPlus.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// GPS
TinyGPSPlus gps;
HardwareSerial GPSserial(2);
#define RXD2 16
#define TXD2 17

// Buzzer
#define BUZZER_PIN 4

// Origin
double originLat = 0.0;
double originLng = 0.0;
bool hasOrigin = false;
const double DISTANCE_THRESHOLD = 2.0;

// WiFi credentials
const char* ssid = "router zte link";
const char* password = "batuponari";

// HTTPS endpoint
const char* serverName = "https://fallertrack.my.id/api/current-distance";

unsigned long lastPostTime = 0;
const unsigned long postInterval = 3000; // 3 seconds

void setup() {
  Serial.begin(115200);
  GPSserial.begin(9600, SERIAL_8N1, RXD2, TXD2);

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}

double distanceBetween(double lat1, double lon1, double lat2, double lon2) {
  const double R = 6371000;
  double dLat = radians(lat2 - lat1);
  double dLon = radians(lon2 - lon1);
  double a = sin(dLat / 2) * sin(dLat / 2) +
             cos(radians(lat1)) * cos(radians(lat2)) *
             sin(dLon / 2) * sin(dLon / 2);
  double c = 2 * atan2(sqrt(a), sqrt(1 - a));
  return R * c;
}

void loop() {
  while (GPSserial.available()) {
    gps.encode(GPSserial.read());
  }

  if (gps.location.isValid()) {
    double currentLat = gps.location.lat();
    double currentLng = gps.location.lng();

    Serial.print("Lat: "); Serial.print(currentLat, 6);
    Serial.print(" | Lng: "); Serial.println(currentLng, 6);

    if (!hasOrigin) {
      originLat = currentLat;
      originLng = currentLng;
      hasOrigin = true;
      Serial.println("Origin location set.");
    } else {
      double distance = distanceBetween(originLat, originLng, currentLat, currentLng);
      Serial.print("Distance from origin: ");
      Serial.print(distance);
      Serial.println(" meters");

      if (distance > DISTANCE_THRESHOLD) {
        digitalWrite(BUZZER_PIN, HIGH);
        delay(300);
        digitalWrite(BUZZER_PIN, LOW);
      }

      // Post location every 3 seconds
      if (millis() - lastPostTime >= postInterval) {
        lastPostTime = millis();

        WiFiClientSecure client;
        client.setInsecure(); // Not validating SSL certificate (for testing only)

        HTTPClient https;
        if (https.begin(client, serverName)) {
          https.addHeader("Content-Type", "application/json");

          String jsonData = "{\"latitude\":";
          jsonData += String(currentLat, 6);
          jsonData += ",\"longitude\":";
          jsonData += String(currentLng, 6);
          jsonData += "}";

          int httpResponseCode = https.POST(jsonData);
          Serial.print("POST Response Code: ");
          Serial.println(httpResponseCode);
          https.end();
        } else {
          Serial.println("HTTPS connection failed");
        }
      }
    }
  } else {
    Serial.println("Waiting for GPS data...");
  }

   delay(1000); 
}
