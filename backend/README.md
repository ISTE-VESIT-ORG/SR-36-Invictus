# AstroView Backend API

Backend server for the AstroView celestial events application.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
   - Copy `.env` and update if needed
   - Default port is 5000

3. Run the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns server status

### Events
- **GET** `/api/events`
  - Get all upcoming celestial events
  - Returns array of events
  - **Cached for 1 hour** to reduce API calls
  - Response includes `cached` flag and cache age

- **GET** `/api/events/:id`
  - Get specific event by ID
  - Returns single event object
  - Checks cache first before fetching from API

### Cache Management
- **GET** `/api/cache/status`
  - Check cache status
  - Returns cache age, remaining time, and event count

- **POST** `/api/cache/clear`
  - Manually clear the cache
  - Forces fresh data fetch on next request

## Caching System

The backend implements smart caching to minimize API requests:

- **Cache Duration**: 1 hour (configurable in .env)
- **Auto-refresh**: Cache automatically refreshes after expiry
- **Fallback**: If API fails, serves stale cache data
- **Benefits**: 
  - Faster response times
  - Reduced API rate limiting
  - Lower bandwidth usage
  - Same events are reused for the day

### Cache Status Example
```bash
curl http://localhost:5000/api/cache/status
```

Response:
```json
{
  "cached": true,
  "eventCount": 12,
  "cacheAgeMinutes": 15,
  "remainingMinutes": 45,
  "isValid": true
}
```

## Data Source

Events are fetched from [The Space Devs API](https://ll.thespacedevs.com/2.2.0/event/upcoming/)
