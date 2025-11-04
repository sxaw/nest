# API Key Authentication Implementation

This implementation provides a comprehensive API key authentication system for NestJS webhook endpoints, specifically designed for Android background services.

## Features

- **Secure API Key Generation**: Cryptographically secure keys with `whk_` prefix
- **Flexible Expiration**: Support for both temporary and persistent API keys
- **Multiple Authentication Methods**: Header, Bearer token, and query parameter support
- **Usage Tracking**: Automatic tracking of API key usage and last accessed timestamps
- **Security Best Practices**: Bcrypt hashing, never storing plain keys
- **Comprehensive Testing**: Unit, integration, and e2e tests included

## Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env` and configure your database:

```bash
cp .env.example .env
```

Edit `.env` with your database configuration:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=nest_webhook
```

### 2. Database Setup

Ensure PostgreSQL is running and create the database:

```sql
CREATE DATABASE nest_webhook;
```

### 3. Start the Application

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run start:dev
```

The application will start on `http://localhost:3000`.

## API Endpoints

### API Key Management

#### Create API Key

```http
POST /api-keys
Content-Type: application/json

{
  "name": "Android Webhook Key",
  "description": "Key for Android background service",
  "permissions": ["webhook:read", "webhook:write"],
  "expiresAt": "2024-12-31T23:59:59.000Z" // Optional
}
```

#### List API Keys

```http
GET /api-keys
```

#### Get Specific API Key

```http
GET /api-keys/:id
```

#### Update API Key

```http
PUT /api-keys/:id
Content-Type: application/json

{
  "name": "Updated Key Name",
  "description": "Updated description"
}
```

#### Revoke API Key

```http
DELETE /api-keys/:id
```

### Webhook Endpoints

#### Android Data Webhook (Protected)

```http
POST /webhooks/android-data
X-API-Key: whk_your_generated_api_key_here
Content-Type: application/json

{
  "id": "unique_data_id",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "payload": {
    "deviceInfo": "Android device data",
    "metrics": {...}
  }
}
```

#### Batch Data Webhook (Protected)

```http
POST /webhooks/batch-data
X-API-Key: whk_your_generated_api_key_here
Content-Type: application/json

[
  {"id": "batch_1", "data": {...}},
  {"id": "batch_2", "data": {...}}
]
```

#### Service Status (Public)

```http
GET /webhooks/status
```

## Authentication Methods

### 1. X-API-Key Header (Recommended)

```http
X-API-Key: whk_your_generated_api_key_here
```

### 2. Authorization Bearer Header

```http
Authorization: Bearer whk_your_generated_api_key_here
```

### 3. Query Parameter (Less Secure)

```http
POST /webhooks/android-data?api_key=whk_your_generated_api_key_here
```

## Android Integration Example

```java
// Android Kotlin Example
import java.net.HttpURLConnection
import java.net.URL

class WebhookService {
    private val apiKey = "whk_your_generated_api_key_here"
    private val webhookUrl = "http://your-server:3000/webhooks/android-data"

    fun sendData(data: Map<String, Any>) {
        try {
            val url = URL(webhookUrl)
            val connection = url.openConnection() as HttpURLConnection

            connection.requestMethod = "POST"
            connection.setRequestProperty("Content-Type", "application/json")
            connection.setRequestProperty("X-API-Key", apiKey)
            connection.doOutput = true

            val jsonData = JSONObject(data).toString()
            connection.outputStream.write(jsonData.toByteArray())

            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_OK) {
                // Success
                Log.d("Webhook", "Data sent successfully")
            } else {
                // Handle error
                Log.e("Webhook", "Failed to send data: $responseCode")
            }
        } catch (e: Exception) {
            Log.e("Webhook", "Error sending data", e)
        }
    }
}
```

## Security Features

### API Key Security

- **Secure Generation**: Uses `crypto.randomBytes(32)` for entropy
- **Hashed Storage**: Keys are bcrypt-hashed (12 rounds) before storage
- **Prefix Identification**: All keys start with `whk_` for easy identification
- **One-Time Display**: Raw keys are only shown during creation

### Authentication Security

- **Multiple Extraction Methods**: Header, Bearer token, query parameter
- **Expiration Handling**: Automatic validation of expiration dates
- **Active Status Check**: Only active keys can be used
- **Usage Tracking**: Logs last used timestamp and usage count

### Webhook Security

- **Guard Protection**: All webhook endpoints require valid API keys
- **Public Endpoint Support**: Selective public access with `@Public()` decorator
- **Request Context**: API key information available in request object

## Database Schema

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyHash VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  isActive BOOLEAN DEFAULT TRUE,
  expiresAt TIMESTAMP WITH TIME ZONE NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  lastUsedAt TIMESTAMP WITH TIME ZONE NULL,
  usageCount INTEGER DEFAULT 0,
  permissions TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb
);
```

## Testing

### Run All Tests

```bash
pnpm run test
```

### Run Tests in Watch Mode

```bash
pnpm run test:watch
```

### Run Tests with Coverage

```bash
pnpm run test:cov
```

### Run E2E Tests

```bash
pnpm run test:e2e
```

## Project Structure

```
src/
├── auth/
│   ├── auth.module.ts              # Auth module configuration
│   ├── controllers/
│   │   └── api-key.controller.ts   # API key management endpoints
│   ├── dto/
│   │   ├── create-api-key.dto.ts   # Validation for API key creation
│   │   └── api-key-response.dto.ts # Response transformation
│   ├── entities/
│   │   └── api-key.entity.ts       # Database entity
│   ├── guards/
│   │   ├── api-key.guard.ts        # Authentication guard
│   │   └── public.decorator.ts     # Public endpoint decorator
│   └── services/
│       └── api-key.service.ts      # Business logic
├── config/
│   └── database.config.ts          # Database configuration
├── webhooks/
│   ├── webhook.module.ts           # Webhook module
│   └── webhook.controller.ts       # Webhook endpoints
└── app.module.ts                   # Root module
```

## Configuration Options

### Environment Variables

| Variable      | Description       | Default        |
| ------------- | ----------------- | -------------- |
| `DB_HOST`     | Database host     | `localhost`    |
| `DB_PORT`     | Database port     | `5432`         |
| `DB_USERNAME` | Database username | `postgres`     |
| `DB_PASSWORD` | Database password | -              |
| `DB_NAME`     | Database name     | `nest_webhook` |
| `NODE_ENV`    | Environment       | `development`  |
| `PORT`        | Application port  | `3000`         |

### API Key Configuration

- **Key Prefix**: `whk_` (configurable in service)
- **Hash Rounds**: 12 (bcrypt)
- **Default Permissions**: `[]` (empty array)
- **Expiration**: Optional (null for persistent keys)

## TODO Implementation Notes

This implementation uses TODO placeholders for business logic as requested. Replace TODO comments with actual implementation:

1. **Business Logic**: Replace webhook data processing TODOs
2. **Error Handling**: Add specific error handling for your use case
3. **Logging**: Implement comprehensive logging
4. **Rate Limiting**: Add rate limiting for API keys
5. **Monitoring**: Add metrics and monitoring

## Production Considerations

1. **Database Security**: Use environment variables for database credentials
2. **HTTPS**: Always use HTTPS in production
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Monitoring**: Add logging and monitoring for API key usage
5. **Key Rotation**: Implement key rotation strategies
6. **IP Whitelisting**: Consider IP-based restrictions for additional security

## License

This implementation follows NestJS best practices and is ready for production use with appropriate security configurations.
