#include <TinyGPSPlus.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <ArduinoJson.h>
#include <SPIFFS.h>
#include "AudioFileSourceSPIFFS.h"
#include "AudioGeneratorMP3.h"
#include "AudioOutputI2S.h"

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
const char *ALERT_SOS_API = "https://fallertrack.my.id/api/alert";

unsigned long lastPostTime = 0;
const unsigned long postInterval = 3000; // 3 seconds

// Audio components
AudioGeneratorMP3* mp3;
AudioFileSourceSPIFFS* file;
AudioOutputI2S* out;

// Function to download and play MP3
void downloadAndPlayMP3(const char* url) {
    WiFiClientSecure client;
    client.setInsecure(); // Skip certificate validation

    // Parse URL to get host and path
    String urlString = String(url);
    String host = urlString.substring(urlString.indexOf("//") + 2, urlString.indexOf("/", 8));
    String path = urlString.substring(urlString.indexOf("/", 8));

    Serial.println("Connecting to host: " + host);
    if (!client.connect(host.c_str(), 443)) {
        Serial.println("Connection failed");
        return;
    }

    // Make HTTP request
    client.print(String("GET ") + path + " HTTP/1.1\r\n" +
                "Host: " + host + "\r\n" +
                "Connection: close\r\n\r\n");

    // Skip headers
    while (client.connected()) {
        String line = client.readStringUntil('\n');
        if (line == "\r") break;
    }

    // Open file for writing
    File f = SPIFFS.open("/nav.mp3", FILE_WRITE);
    if (!f) {
        Serial.println("Failed to open file");
        return;
    }

    // Download file
    int bytes = 0;
    while (client.connected() || client.available()) {
        uint8_t buf[512];
        int len = client.read(buf, sizeof(buf));
        if (len > 0) {
            f.write(buf, len);
            bytes += len;
        } else {
            delay(10);
        }
    }
    f.close();
    Serial.printf("Downloaded %d bytes\n", bytes);

    // Play the audio
    file = new AudioFileSourceSPIFFS("/nav.mp3");
    out = new AudioOutputI2S(0, AudioOutputI2S::INTERNAL_DAC);
    out->SetOutputModeMono(true);
    out->SetGain(0.5);

    mp3 = new AudioGeneratorMP3();
    mp3->begin(file, out);
}

// Function to get navigation instructions
void getNavigationInstructions() {
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient https;

    if (https.begin(client, NAVIGATION_API)) {
        int httpResponseCode = https.GET();
        Serial.print("Navigation GET Response Code: ");
        Serial.println(httpResponseCode);
        
        if (httpResponseCode > 0) {
            String response = https.getString();
            Serial.println("Navigation Instructions: " + response);

            // Parse JSON response
            StaticJsonDocument<1024> doc;
            DeserializationError error = deserializeJson(doc, response);

            if (!error) {
                const char* text = doc["text"];
                const char* url = doc["bucketStatus"]["url"];
                Serial.println("Navigation text: " + String(text));
                Serial.println("Audio URL: " + String(url));

                // Download and play the audio if URL is available
                if (url) {
                    downloadAndPlayMP3(url);
                }
            }
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

// Function to check alert status
void checkAlertStatus() {
    WiFiClientSecure client;
    client.setInsecure(); // Not validating SSL certificate (for testing only)
    HTTPClient https;

    if (https.begin(client, ALERT_SOS_API)) {
        int httpResponseCode = https.GET();
        Serial.print("Alert GET Response Code: ");
        Serial.println(httpResponseCode);
        
        if (httpResponseCode > 0) {
            String response = https.getString();
            Serial.println("Alert Response: " + response);
            
            // Parse JSON response
            // Parse JSON response
            StaticJsonDocument<200> doc;
            DeserializationError error = deserializeJson(doc, response);
            
            if (!error && doc["sos"].as<bool>()) {
                // Alert is active, trigger buzzer
                digitalWrite(BUZZER_PIN, HIGH);
                delay(1000);  // Beep for 500ms
                digitalWrite(BUZZER_PIN, LOW); 
                delay(100);  // Pause for 500ms
            } else {
                // No alert, ensure buzzer is off
                digitalWrite(BUZZER_PIN, LOW);
            }
        }
        
        https.end();
    } else {
        Serial.println("Alert HTTPS connection failed");
    }
}

void setup()
{
    Serial.begin(115200);
    Wire.begin(22, 21);

    // Init Navigation Button
    pinMode(NAVIGATION_BUTTON_PIN, INPUT_PULLUP);

    // Init Buzzer
    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW);

    // Init GPS
    GPSserial.begin(9600, SERIAL_8N1, RXD2, TXD2);

    // Init SPIFFS
    if (!SPIFFS.begin(true)) {
        Serial.println("SPIFFS initialization failed!");
        return;
    }

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
    // Handle MP3 playback
    if (mp3 && mp3->isRunning()) {
        if (!mp3->loop()) {
            mp3->stop();
            delete file;
            delete out;
            delete mp3;
            mp3 = nullptr;
        }
    }

    // Check for alerts
    checkAlertStatus();

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

    if (gps.location.isValid())
    {
        // Default coordinates for Jakarta (Monas area)
        double currentLat = gps.location.lat();
        double currentLng = gps.location.lng();


        Serial.print("Lat: ");
        Serial.print(currentLat);
        Serial.print(" | Lng: ");
        Serial.println(currentLng);

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

    delay(3000);
}