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

// Navigation Button
#define NAVIGATION_BUTTON_PIN 0  // G0 pin
unsigned long lastButtonPress = 0;  // Debounce timer
const unsigned long DEBOUNCE_DELAY = 250;  // Debounce delay in milliseconds

// Origin
double originLat = 0.0;
double originLng = 0.0;
bool hasOrigin = false;
const double DISTANCE_THRESHOLD = 2.0;

// HTTPS endpoint POST/GET
const char *GPS_DISTANCE_API = "https://fallertrack.my.id/api/current-distance";
const char *GYRO_FALL_API = "https://fallertrack.my.id/api/fall-detection";
const char *NAVIGATION_API = "https://fallertrack.my.id/api/text-to-speech";

// HTTPS endpoint GET
const char *SOS_API = "https://fallertrack.my.id/api/sos";

unsigned long lastPostTime = 0;
const unsigned long postInterval = 3000; // 3 seconds

// Function to get navigation instructions
void getNavigationInstructions() {
    WiFiClientSecure client;
    client.setInsecure(); // Not validating SSL certificate (for testing only)
    HTTPClient https;

    if (https.begin(client, NAVIGATION_API)) {
        int httpResponseCode = https.GET();
        Serial.print("Navigation GET Response Code: ");
        Serial.println(httpResponseCode);
        
        if (httpResponseCode > 0) {
            String response = https.getString();
            Serial.println("Navigation Instructions: " + response);
            // Here you can add additional handling for the navigation response
            // For example, playing audio or displaying on a screen
        }
        
        https.end();
    } else {
        Serial.println("Navigation HTTPS connection failed");
    }
}

// Function to post GPS data
void postGPSData(double latitude, double longitude) {
    WiFiClientSecure client;
    client.setInsecure(); // Not validating SSL certificate (for testing only)
    HTTPClient https;

    if (https.begin(client, GPS_DISTANCE_API)) {
        https.addHeader("Content-Type", "application/json");

        String jsonData = "{\"latitude\":";
        jsonData += String(latitude);
        jsonData += ",\"longitude\":";
        jsonData += String(longitude);
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
    client.setInsecure(); // Not validating SSL certificate (for testing only)
    HTTPClient https;

    if (https.begin(client, GYRO_FALL_API)) {
        https.addHeader("Content-Type", "application/json");

        // Format JSON to match curl request format
        String jsonData = "{\"accelero\":[";
        jsonData += String(accelero[0], 1) + ",";  // x-axis
        jsonData += String(accelero[1], 1) + ",";  // y-axis
        jsonData += String(accelero[2], 1);        // z-axis
        jsonData += "],\"gyro\":[";
        jsonData += String(gyro[0], 1) + ",";      // x-axis
        jsonData += String(gyro[1], 1) + ",";      // y-axis
        jsonData += String(gyro[2], 1);            // z-axis
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

void setup()
{
    Serial.begin(115200);
    Wire.begin(22, 21);

    // Init Navigation Button
    pinMode(NAVIGATION_BUTTON_PIN, INPUT_PULLUP);

    // Init GPS
    GPSserial.begin(9600, SERIAL_8N1, RXD2, TXD2);

    // pinMode(BUZZER_PIN, OUTPUT);
    // digitalWrite(BUZZER_PIN, LOW);

    // Init Wifi
    Serial.println("Connecting to WiFi...");
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi Connected!");

    // Init MPU6050
    if (mpu.begin())
    {
        Serial.println("Failed to find MPU6050 chip");
        while (1)
        {
            delay(10);
        }
    }
    Serial.println("MPU6050 Found!");

    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_5_HZ);

    delay(1000);
}

void loop()
{
    // Check navigation button with debounce
    if (digitalRead(NAVIGATION_BUTTON_PIN) == LOW) {  // Button pressed (active LOW with pullup)
        unsigned long currentTime = millis();
        if (currentTime - lastButtonPress > DEBOUNCE_DELAY) {
            Serial.println("Navigation button pressed!");
            getNavigationInstructions();
            lastButtonPress = currentTime;
        }
    }

    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);

    while (GPSserial.available())
    {
        gps.encode(GPSserial.read());
    }

    if (!gps.location.isValid())
    {
        // Default coordinates for Jakarta (Monas area)
        double currentLat = -6.175392;  // Jakarta latitude
        double currentLng = 106.827153; // Jakarta longitude

        Serial.print("Lat: ");
        Serial.print(currentLat, 6);
        Serial.print(" | Lng: ");
        Serial.println(currentLng, 6);

        if (!hasOrigin)
        {
            originLat = currentLat;
            originLng = currentLng;
            hasOrigin = true;
            Serial.println("Origin location set.");
        }
        else
        {
            // Post data every 3 seconds
            if (millis() - lastPostTime >= postInterval)
            {
                lastPostTime = millis();
                
                // Post GPS data
                postGPSData(currentLat, currentLng);
                
                // Create arrays for accelerometer and gyroscope data
                float acceleroData[3] = {
                    a.acceleration.x,
                    a.acceleration.y,
                    a.acceleration.z
                };
                float gyroData[3] = {
                    g.gyro.x,
                    g.gyro.y,
                    g.gyro.z
                };
                
                // Post accelerometer data with arrays
                postAccelerometerData(acceleroData, gyroData);
            }
        }
    }
    else
    {
        Serial.println("Waiting for GPS data...");
    }

    delay(1000);
}