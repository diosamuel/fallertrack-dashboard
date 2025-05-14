#include <TinyGPSPlus.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>

// GYRO ACCELEROMETER
Adafruit_MPU6050 mpu;

// WiFi credentials
const char *ssid = "router zte link";
const char *password = "batuponari";

// GPS
TinyGPSPlus gps;
HardwareSerial GPSserial(2);
#define RXD2 16
#define TXD2 17

// Buzzer
#define BUZZER_PIN 4

// Mockup GPS coordinates (around Jakarta)
double mockLat = -6.2088;  // Jakarta latitude
double mockLng = 106.8456; // Jakarta longitude
double mockLatVariation = 0.0001; // Small variation for simulation
double mockLngVariation = 0.0001;

// Mockup MPU6050 data
float mockAccelero[3] = {9.8, 0.1, 0.1};  // Initial values
float mockGyro[3] = {0.1, 0.2, 0.3};      // Initial values

// Origin
double originLat = 0.0;
double originLng = 0.0;
bool hasOrigin = false;
const double DISTANCE_THRESHOLD = 2.0;

// HTTPS endpoint POST/GET
const char *GPS_DISTANCE_API = "https://fallertrack.my.id/api/current-distance";
const char *GYRO_FALL_API = "https://fallertrack.my.id/api/fall-detection";

// HTTPS endpoint GET
const char *SOS_API = "https://fallertrack.my.id/api/sos";

unsigned long lastPostTime = 0;
const unsigned long postInterval = 3000; // 3 seconds

// Function to generate mockup GPS data
void updateMockGPS() {
    // Add small random variations to simulate movement
    mockLat += (random(-100, 100) / 1000000.0);
    mockLng += (random(-100, 100) / 1000000.0);
    
    // Keep coordinates within reasonable bounds
    mockLat = constrain(mockLat, -6.3, -6.1);
    mockLng = constrain(mockLng, 106.7, 107.0);
}

// Function to generate mockup MPU6050 data
void updateMockMPU() {
    // Simulate accelerometer data (mostly gravity with small variations)
    mockAccelero[0] = 9.8 + (random(-50, 50) / 100.0);  // x-axis
    mockAccelero[1] = 0.1 + (random(-20, 20) / 100.0);  // y-axis
    mockAccelero[2] = 0.1 + (random(-20, 20) / 100.0);  // z-axis

    // Simulate gyroscope data (small rotations)
    mockGyro[0] = 0.1 + (random(-30, 30) / 100.0);      // x-axis
    mockGyro[1] = 0.2 + (random(-30, 30) / 100.0);      // y-axis
    mockGyro[2] = 0.3 + (random(-30, 30) / 100.0);      // z-axis
}

// Function to post GPS data
void postGPSData(double latitude, double longitude) {
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient https;

    if (https.begin(client, GPS_DISTANCE_API)) {
        https.addHeader("Content-Type", "application/json");

        String jsonData = "{\"latitude\":";
        jsonData += String(latitude, 6);
        jsonData += ",\"longitude\":";
        jsonData += String(longitude, 6);
        jsonData += "}";

        int httpResponseCode = https.POST(jsonData);
        Serial.print("GPS POST Response Code: ");
        Serial.println(httpResponseCode);
        
        if (httpResponseCode > 0) {
            String response = https.getString();
            Serial.println("GPS Response: " + response);
        }
        
        https.end();
    } else {
        Serial.println("GPS HTTPS connection failed");
    }
}

// Function to post accelerometer data
void postAccelerometerData(float accelero[3], float gyro[3]) {
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient https;

    if (https.begin(client, GYRO_FALL_API)) {
        https.addHeader("Content-Type", "application/json");

        String jsonData = "{\"accelero\":[";
        jsonData += String(accelero[0], 1) + ",";
        jsonData += String(accelero[1], 1) + ",";
        jsonData += String(accelero[2], 1);
        jsonData += "],\"gyro\":[";
        jsonData += String(gyro[0], 1) + ",";
        jsonData += String(gyro[1], 1) + ",";
        jsonData += String(gyro[2], 1);
        jsonData += "]}";

        int httpResponseCode = https.POST(jsonData);
        Serial.print("Accelerometer POST Response Code: ");
        Serial.println(httpResponseCode);
        
        if (httpResponseCode > 0) {
            String response = https.getString();
            Serial.println("Accelerometer Response: " + response);
        }
        
        https.end();
    } else {
        Serial.println("Accelerometer HTTPS connection failed");
    }
}

void setup() {
    Serial.begin(115200);
    Wire.begin(22, 21);
    randomSeed(analogRead(0));  // Initialize random number generator

    // Init GPS
    GPSserial.begin(9600, SERIAL_8N1, RXD2, TXD2);

    // pinMode(BUZZER_PIN, OUTPUT);
    // digitalWrite(BUZZER_PIN, LOW);

    // Init WiFi
    Serial.println("Connecting to WiFi...");
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi Connected!");

    // Set initial origin
    originLat = mockLat;
    originLng = mockLng;
    hasOrigin = true;
    Serial.println("Mock origin location set.");

    delay(1000);
}

// UTILITY FUNCTIONS
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
    // Update mockup data
    updateMockGPS();
    updateMockMPU();

    // Print mockup data
    Serial.print("Mock GPS - Lat: ");
    Serial.print(mockLat, 6);
    Serial.print(" | Lng: ");
    Serial.println(mockLng, 6);

    Serial.print("Mock MPU - Accelero: [");
    Serial.print(mockAccelero[0], 1);
    Serial.print(", ");
    Serial.print(mockAccelero[1], 1);
    Serial.print(", ");
    Serial.print(mockAccelero[2], 1);
    Serial.print("] Gyro: [");
    Serial.print(mockGyro[0], 1);
    Serial.print(", ");
    Serial.print(mockGyro[1], 1);
    Serial.print(", ");
    Serial.print(mockGyro[2], 1);
    Serial.println("]");

    // Calculate distance from origin
    double distance = distanceBetween(originLat, originLng, mockLat, mockLng);
    Serial.print("Distance from origin: ");
    Serial.print(distance);
    Serial.println(" meters");

    // Post data every 3 seconds
    if (millis() - lastPostTime >= postInterval) {
        lastPostTime = millis();
        
        // Post GPS data
        postGPSData(mockLat, mockLng);
        
        // Post accelerometer data
        postAccelerometerData(mockAccelero, mockGyro);
    }

    delay(1000);
}