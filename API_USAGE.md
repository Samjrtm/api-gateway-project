# API Usage Guide

## Overview
This is a restricted API access system with JWT and API Key authentication. All responses are in JSON format.

## Authentication Methods

### 1. JWT Token Authentication
Use the JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

Generate a test JWT token:
```bash
node src/test-token.js
```

### 2. API Key Authentication
Use the API key in the X-API-Key header:
```
X-API-Key: YOUR_API_KEY
```

## Available Endpoints

### Health Check
```bash
GET /health
```
No authentication required.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-10-21T06:48:00.000Z"
}
```

### Create API Key
```bash
POST /api/keys/create
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "My API Key",
  "rateLimit": 100,
  "expiresAt": null
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "apiKey": "sk_...",
    "name": "My API Key",
    "rateLimit": 100,
    "createdAt": "2025-10-21T06:48:00.000Z",
    "expiresAt": null
  },
  "message": "API key created successfully. Store this key securely - it cannot be retrieved again."
}
```

### List API Keys
```bash
GET /api/keys
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "test-user",
      "name": "My API Key",
      "is_active": true,
      "rate_limit": 100,
      "last_used_at": "2025-10-21T06:48:00.000Z",
      "created_at": "2025-10-21T06:48:00.000Z",
      "expires_at": null
    }
  ],
  "count": 1
}
```

### Revoke API Key
```bash
DELETE /api/keys/:keyId
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "API key revoked successfully"
}
```

### Get Vehicle Positions
```bash
GET /api/vehicles/:uid/positions
X-API-Key: YOUR_API_KEY
# OR
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vehicles": [
      {
        "id": "vehicle-uid",
        "name": "Vehicle Name",
        "lastUpdate": "2025-10-21T06:48:00.000Z",
        "location": {
          "lat": 40.7128,
          "lng": -74.0060,
          "address": "123 Main St"
        },
        "status": {
          "speed": 60,
          "unit": "km/h",
          "heading": 90,
          "ignition": true,
          "engine": "ON"
        }
      }
    ],
    "count": 1
  },
  "timestamp": "2025-10-21T06:48:00.000Z"
}
```

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common Error Codes
- **401 Unauthorized**: Missing authentication
- **403 Forbidden**: Invalid API key or JWT token
- **404 Not Found**: Endpoint or resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## Rate Limiting

- Rate limits are configurable per API key (default: 100 requests/minute)
- When exceeded, you'll receive a 429 status code
- Rate limit resets every minute
- All requests are logged in the database

## Getting Started

1. Start the server:
```bash
npm start
```

2. Generate a JWT token:
```bash
node src/test-token.js
```

3. Create an API key:
```bash
curl -X POST http://localhost:8000/api/keys/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"My API Key","rateLimit":100}'
```

4. Use the API key to access protected endpoints:
```bash
curl -X GET http://localhost:8000/api/vehicles/YOUR_UID/positions \
  -H "X-API-Key: YOUR_API_KEY"
```

## Security Best Practices

1. Store API keys securely
2. Never commit API keys to version control
3. Use HTTPS in production
4. Rotate API keys regularly
5. Set appropriate rate limits
6. Monitor API usage through request logs
7. Use expiration dates for temporary access
