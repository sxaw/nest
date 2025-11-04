# Android Health Data API

This document describes the Android Health Data API endpoint for processing health data from Google Health Connect.

## Endpoint

`POST /health/android-data`

## Description

Receives health data points from Android devices, processes them by writing to the database, and publishes each data point to an MQTT server.

## Request Format

```json
{
  "dataPoints": [
    {
      "metricType": "HEART_RATE",
      "valueNumeric": 72,
      "unit": "bpm",
      "recordedAt": "2025-01-01T10:00:00Z",
      "userId": "user-123",
      "deviceInfo": {
        "manufacturer": "Google",
        "model": "Pixel 7",
        "platform": "Android",
        "osVersion": "14",
        "appVersion": "1.0.0"
      },
      "sourceApp": "HealthConnect",
      "metadata": {}
    }
  ]
}
```

## Supported Metric Types

- `HEART_RATE` - Heart rate in beats per minute (bpm)
- `STEPS` - Step count (steps)
- `SLEEP` - Sleep session data (complex JSON object)
- `WEIGHT` - Weight in kilograms (kg)
- `BLOOD_OXYGEN` - Blood oxygen saturation percentage (%)
- `TEMPERATURE` - Body temperature in Celsius (°C)
- `NUTRITION` - Nutrition data (complex JSON object)
- `EXERCISE` - Exercise session data (complex JSON object)
- `BLOOD_PRESSURE` - Blood pressure readings
- `BLOOD_GLUCOSE` - Blood glucose levels
- `HYDRATION` - Hydration data
- `MINDFULNESS` - Mindfulness session data
- `RESPIRATORY_RATE` - Respiratory rate
- `BODY_FAT` - Body fat percentage
- `HEIGHT` - Height in centimeters
- `DISTANCE` - Distance in meters
- `CALORIES` - Calorie burn
- `ACTIVE_MINUTES` - Active minutes count
- `STRESS_LEVEL` - Stress level measurement

## Field Descriptions

- `metricType` (required): Enum value from the supported metric types
- `valueNumeric` (optional): Numeric value for simple metrics
- `valueJson` (optional): JSON object for complex metrics (sleep, nutrition, exercise)
- `unit` (optional): Unit of measurement (bpm, steps, kg, %, etc.)
- `recordedAt` (required): ISO 8601 timestamp when the health data was recorded
- `userId` (optional): User identifier for associating data with users
- `deviceInfo` (optional): Device information object
- `sourceApp` (optional): Source application name
- `metadata` (optional): Additional metric-specific metadata

## Response Format

```json
{
  "status": "processed",
  "total": 1,
  "successful": 1,
  "failed": 0,
  "timestamp": "2025-01-01T10:05:00Z"
}
```

## Example Requests

### Simple Heart Rate Data

```bash
curl -X POST http://localhost:3000/health/android-data \
  -H "Content-Type: application/json" \
  -d '{
    "dataPoints": [
      {
        "metricType": "HEART_RATE",
        "valueNumeric": 72,
        "unit": "bpm",
        "recordedAt": "2025-01-01T10:00:00Z",
        "userId": "user-123",
        "deviceInfo": {
          "manufacturer": "Google",
          "model": "Pixel 7"
        }
      }
    ]
  }'
```

### Complex Sleep Data

```bash
curl -X POST http://localhost:3000/health/android-data \
  -H "Content-Type: application/json" \
  -d '{
    "dataPoints": [
      {
        "metricType": "SLEEP",
        "valueJson": {
          "stages": [
            { "stage": "AWAKE", "duration": 300 },
            { "stage": "LIGHT_SLEEP", "duration": 1800 },
            { "stage": "DEEP_SLEEP", "duration": 2400 },
            { "stage": "REM_SLEEP", "duration": 900 }
          ],
          "totalDuration": 5400,
          "efficiency": 85
        },
        "recordedAt": "2025-01-01T08:00:00Z",
        "userId": "user-123"
      }
    ]
  }'
```

### Batch Multiple Data Points

```bash
curl -X POST http://localhost:3000/health/android-data \
  -H "Content-Type: application/json" \
  -d '{
    "dataPoints": [
      {
        "metricType": "HEART_RATE",
        "valueNumeric": 72,
        "unit": "bpm",
        "recordedAt": "2025-01-01T10:00:00Z",
        "userId": "user-123"
      },
      {
        "metricType": "STEPS",
        "valueNumeric": 1000,
        "unit": "steps",
        "recordedAt": "2025-01-01T10:05:00Z",
        "userId": "user-123"
      },
      {
        "metricType": "BLOOD_OXYGEN",
        "valueNumeric": 98,
        "unit": "%",
        "recordedAt": "2025-01-01T10:10:00Z",
        "userId": "user-123"
      }
    ]
  }'
```

## MQTT Publishing

Each processed health data point is published to an MQTT topic with the format:
`health/user/{userId}/{metricType}`

Example topic: `health/user/user-123/heart_rate`

The MQTT payload contains the complete processed health data point object.

## Data Retrieval

### Get Health Data by User

```bash
curl "http://localhost:3000/health/data?userId=user-123&limit=50"
```

### Get Health Data by Metric Type

```bash
curl "http://localhost:3000/health/data?metricType=HEART_RATE&limit=100"
```

## Error Handling

- Invalid data formats will return validation errors
- Processing errors are tracked in the response (failed count)
- MQTT publishing failures don't break the main operation but are logged
- Database errors are tracked individually for each data point

## Environment Variables

Configure MQTT connection using environment variables:

- `MQTT_BROKER_URL`: MQTT broker URL (default: mqtt://localhost:1883)
- `MQTT_CLIENT_ID`: MQTT client ID (default: auto-generated)