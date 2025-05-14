#include <Arduino.h>

#ifdef ESP32
#include <WiFi.h>
#else
#include <ESP8266WiFi.h>
#endif

#include "AudioFileSourceICYStream.h"
#include "AudioFileSourceBuffer.h"
#include "AudioGeneratorMP3.h"
#include "AudioOutputI2S.h"

// WiFi credentials
const char *SSID = "router zte link";
const char *PASSWORD = "batuponari";

// MP3 source URL
const char *URL = "http://stream.radioparadise.com/mp3-192";

AudioGeneratorMP3 *mp3;
AudioFileSourceICYStream *file;
AudioFileSourceBuffer *buff;
AudioOutputI2S *out;

// Callback metadata
void MDCallback(void *cbData, const char *type, bool isUnicode, const char *string)
{
    const char *ptr = reinterpret_cast<const char *>(cbData);
    char s1[32], s2[64];
    strncpy_P(s1, type, sizeof(s1));
    s1[sizeof(s1) - 1] = 0;
    strncpy_P(s2, string, sizeof(s2));
    s2[sizeof(s2) - 1] = 0;
    Serial.printf("METADATA(%s) '%s' = '%s'\n", ptr, s1, s2);
}

// Callback status
void StatusCallback(void *cbData, int code, const char *string)
{
    const char *ptr = reinterpret_cast<const char *>(cbData);
    char s1[64];
    strncpy_P(s1, string, sizeof(s1));
    s1[sizeof(s1) - 1] = 0;
    Serial.printf("STATUS(%s) '%d' = '%s'\n", ptr, code, s1);
}

void setup()
{
    Serial.begin(115200);
    delay(1000);
    Serial.println("Connecting to WiFi...");

    WiFi.disconnect();
    WiFi.softAPdisconnect(true);
    WiFi.mode(WIFI_STA);
    WiFi.begin(SSID, PASSWORD);

    while (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("...Connecting to WiFi");
        delay(1000);
    }
    Serial.println("Connected to WiFi");

    Serial.println("Setting up audio components...");

    file = new AudioFileSourceICYStream(URL);
    file->RegisterMetadataCB(MDCallback, (void *)"ICY");

    buff = new AudioFileSourceBuffer(file, 8096);
    buff->RegisterStatusCB(StatusCallback, (void *)"buffer");

    out = new AudioOutputI2S(0, AudioOutputI2S::INTERNAL_DAC);
    out->SetGain(0.5); // 0.0 - 1.0

    mp3 = new AudioGeneratorMP3();
    mp3->RegisterStatusCB(StatusCallback, (void *)"mp3");

    Serial.println("Starting MP3 playback...");
    bool success = mp3->begin(buff, out);
    if (!success)
    {
        Serial.println("ERROR: mp3->begin() failed!");
    }
    else
    {
        Serial.println("MP3 playback started successfully.");
    }
}

void loop()
{
    static int lastms = 0;

    if (mp3->isRunning())
    {
        if (millis() - lastms > 1000)
        {
            lastms = millis();
            Serial.printf("Running for %d ms...\n", lastms);
        }

        if (!mp3->loop())
        {
            Serial.println("mp3->loop() returned false. Stopping...");
            mp3->stop();
            delay(1000);
            Serial.println("Attempting to restart MP3 playback...");
            bool success = mp3->begin(buff, out);
            if (!success)
            {
                Serial.println("ERROR: Failed to restart MP3 playback.");
            }
            else
            {
                Serial.println("Playback restarted.");
            }
        }
    }
    else
    {
        Serial.println("MP3 is not running. Restarting...");
        delay(1000);
        bool success = mp3->begin(buff, out);
        if (!success)
        {
            Serial.println("ERROR: Failed to start MP3 playback.");
        }
        else
        {
            Serial.println("MP3 playback restarted.");
        }
    }
}
