# API Gateway with Vehicle Tracking

A secure API Gateway for managing vehicle tracking data with JWT and API key authentication, built with Express, Supabase, and a modern web dashboard.

## Features

- **Dual Authentication**: JWT tokens for admin operations, API keys for data access
- **Vehicle Tracking**: Real-time GPS position tracking from 3DTracking API
- **API Key Management**: Create, list, and revoke API keys via dashboard or API
- **Rate Limiting**: Global and per-key rate limits to prevent abuse
- **Request Logging**: Track all API usage in Supabase database
- **Web Dashboard**: Beautiful, responsive UI for API testing and management
- **Smart Caching**: Redis with automatic in-memory fallback
- **Secure Storage**: API keys are hashed, RLS enabled on all tables

## Quick Start

```bash
npm install
npm start
```

API runs on `http://localhost:8000`

For the web dashboard:
```bash
npm run dev
```

Dashboard runs on `http://localhost:3000`

## Generate a Test Token

```bash
node src/test-token.js
```

Copy the JWT token and use it in the dashboard or API calls.

## Project Structure

```
├── src/
│   ├── api.js              # Main Express server
│   ├── auth.js             # JWT authentication middleware
│   ├── apiKeyManager.js    # API key operations
│   ├── cache.js            # Redis/in-memory cache
│   ├── config.js           # Configuration loader
│   ├── fetcher.js          # External API integration
│   ├── supabase.js         # Supabase client
│   └── test-token.js       # JWT token generator
├── supabase/
│   └── migrations/         # Database migrations
├── index.html              # Dashboard UI
├── main.js                 # Dashboard logic
├── style.css               # Dashboard styles
└── .env                    # Environment configuration
```

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Cache**: Redis with in-memory fallback
- **Frontend**: Vanilla JavaScript, Vite
- **Authentication**: JWT + API Keys
- **External API**: 3DTracking GPS tracking

## Documentation

- [Getting Started Guide](GETTING_STARTED.md) - Complete setup and usage guide
- [API Usage Documentation](API_USAGE.md) - All endpoints and examples

## Environment Variables

Required variables in `.env`:

```env
APP_PORT=8000
JWT_SECRET=your_secret_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

## API Endpoints

### Public
- `GET /health` - Health check

### Admin (JWT Required)
- `POST /api/keys/create` - Create API key
- `GET /api/keys` - List API keys
- `DELETE /api/keys/:id` - Revoke API key

### Data Access (API Key or JWT)
- `GET /api/vehicles/:uid/positions` - Get vehicle positions

## Security Features

- API keys hashed with SHA-256 before storage
- Row Level Security on all database tables
- Rate limiting (100 req/min global, configurable per key)
- Request logging for audit trails
- CORS enabled for web dashboard
- JWT tokens with 2-hour expiration

## Development

Build the frontend:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## License

Private project
