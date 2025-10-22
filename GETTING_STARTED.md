# Getting Started

This guide will help you get the API Gateway fully functional.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

The `.env` file is already configured with:
- Supabase connection (database)
- JWT secret for authentication
- External API credentials
- Redis URL (optional, falls back to in-memory cache)

### 3. Start the Backend API

```bash
npm start
```

The API server will start on `http://localhost:8000`

### 4. Start the Frontend Dashboard (Optional)

In a new terminal window:

```bash
npm run dev
```

The dashboard will start on `http://localhost:3000`

## Using the Application

### Option 1: Using the Web Dashboard

1. Open `http://localhost:3000` in your browser
2. Generate a JWT token:
   ```bash
   node src/test-token.js
   ```
3. Copy the token and paste it in the dashboard
4. Select "JWT Token" as authentication method
5. Click any endpoint to test it

### Option 2: Using cURL

#### Generate a JWT Token

```bash
node src/test-token.js
```

#### Test the Health Endpoint

```bash
curl http://localhost:8000/health
```

#### Create an API Key

```bash
curl -X POST http://localhost:8000/api/keys/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My First API Key",
    "rateLimit": 100
  }'
```

#### List Your API Keys

```bash
curl http://localhost:8000/api/keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Use an API Key to Fetch Vehicle Positions

```bash
curl http://localhost:8000/api/vehicles/YOUR_VEHICLE_UID/positions \
  -H "X-API-Key: YOUR_API_KEY"
```

## Available Endpoints

### Public Endpoints
- `GET /health` - Health check (no authentication required)

### Authenticated Endpoints (JWT Required)
- `POST /api/keys/create` - Create a new API key
- `GET /api/keys` - List all your API keys
- `DELETE /api/keys/:keyId` - Revoke an API key

### API Key Protected Endpoints
- `GET /api/vehicles/:uid/positions` - Get vehicle positions (requires API key or JWT)

## Features

### Authentication
- **JWT Token**: For administrative operations (creating/listing/revoking API keys)
- **API Key**: For accessing vehicle data endpoints

### Caching
- Redis caching with automatic fallback to in-memory cache
- Session caching for external API authentication

### Rate Limiting
- Global rate limit: 100 requests per minute
- Per-API-key rate limits (configurable)

### Database
- Supabase PostgreSQL database
- API key storage with secure hashing
- Request logging for analytics

### Security
- API keys are hashed before storage
- Row Level Security (RLS) enabled on all tables
- Rate limiting to prevent abuse
- Request logging for audit trails

## Troubleshooting

### Redis Connection Errors

If you see Redis connection errors, don't worry! The application automatically falls back to in-memory caching. This is normal if Redis is not running.

To disable Redis warnings, you can comment out or remove the `REDIS_URL` in `.env`:

```env
# REDIS_URL=redis://redis:6379
```

### JWT Token Expired

JWT tokens expire after 2 hours. Generate a new one:

```bash
node src/test-token.js
```

### Supabase Connection Issues

Make sure your `.env` has valid Supabase credentials:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY`

## Next Steps

1. **Customize Rate Limits**: Edit `src/api.js` to adjust global rate limiting
2. **Add More Endpoints**: Extend the API with additional vehicle tracking features
3. **Set Up Production**: Configure proper JWT secrets and deploy to a production environment
4. **Enable Redis**: Set up a Redis server for better caching performance

## Support

For detailed API documentation, see [API_USAGE.md](API_USAGE.md)
