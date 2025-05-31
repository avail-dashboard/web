# API Integration Guide

This guide explains how to set up and use the backend API integration for the Avail Explorer frontend.

## Overview

The frontend is configured to work with both **development** and **production** environments with automatic fallback support:

- **Primary**: Backend API server (recommended)
- **Fallback**: Direct external API calls (Subscan, CoinGecko)

## Environment Configuration

### Development Setup

1. **Create environment file:**

```bash
# In the web/ directory
cp .env.example .env.local
```

2. **Configure environment variables:**

```bash
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.avail.naxatar.com/api
NEXT_PUBLIC_WS_URL=wss://api.avail.naxatar.com
NEXT_PUBLIC_NODE_ENV=development
```

### Production Setup

```bash
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.avail.naxatar.com/api
NEXT_PUBLIC_WS_URL=wss://api.avail.naxatar.com
NEXT_PUBLIC_NODE_ENV=production
```

## Backend API Endpoints

The integration expects the following endpoints from your backend server:

### Core Endpoints

- `GET /api/blocks` - Latest blocks with pagination
- `GET /api/blocks/:numberOrHash` - Specific block details
- `GET /api/chain/stats` - Chain statistics and metrics
- `GET /api/extrinsics` - Extrinsics with filtering
- `GET /api/validators` - Validators list
- `GET /api/accounts/:address` - Account details
- `GET /api/search` - Search functionality
- `GET /api/analytics` - Analytics data

### System Endpoints

- `GET /health` - Backend health check
- WebSocket at root for real-time updates

### Expected Response Format

All API responses should follow this format:

```typescript
{
  success: boolean
  data: T // The actual data
  error?: string
  timestamp: string
}
```

## Using the API Integration

### Basic Usage

```typescript
import { availAPI } from '@/lib/api'

// Get latest blocks
const blocks = await availAPI.getLatestBlocks(10)

// Get chain statistics
const chainData = await availAPI.getChainData()

// Search
const results = await availAPI.search('block_hash_or_number')
```

### React Hooks (Recommended)

```typescript
import { useBlocks, useChainData, useBackendStatus } from '@/lib/hooks/useAvailAPI'

function MyComponent() {
  // Auto-refreshing blocks data
  const { data: blocks, loading, error } = useBlocks(10)

  // Chain statistics with 30s refresh
  const { data: chainData } = useChainData()

  // Backend connection status
  const { isConnected } = useBackendStatus()

  return (
    <div>
      {!isConnected && <div>⚠️ Backend offline, using fallback data</div>}
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {blocks && <BlocksList blocks={blocks} />}
    </div>
  )
}
```

### Real-time Updates

```typescript
import { useWebSocket } from '@/lib/hooks/useAvailAPI'

function RealtimeComponent() {
  const { connected, subscribe, unsubscribe } = useWebSocket({
    onBlockUpdate: (block) => {
      console.log('New block:', block)
    },
    onChainStatsUpdate: (stats) => {
      console.log('Updated stats:', stats)
    }
  })

  useEffect(() => {
    if (connected) {
      subscribe('blocks')
      subscribe('chain')
    }

    return () => {
      unsubscribe('blocks')
      unsubscribe('chain')
    }
  }, [connected])

  return <div>WebSocket: {connected ? '🟢' : '🔴'}</div>
}
```

## Status Monitoring

### Backend Status Component

```typescript
import { BackendStatus } from '@/components/BackendStatus'

// Simple status indicator
<BackendStatus />

// Detailed system status
<BackendStatus showDetails={true} />
```

### Status Badge for Navigation

```typescript
import { StatusBadge } from '@/components/BackendStatus'

<StatusBadge className="ml-4" />
```

## Fallback Behavior

The system automatically handles backend failures:

1. **Health Check**: Automatic backend availability detection
2. **Graceful Degradation**: Falls back to external APIs when backend is unavailable
3. **Auto-Recovery**: Periodically checks backend availability and switches back when available
4. **User Notification**: Visual indicators when operating in fallback mode

## API Proxy Routes

The frontend includes Next.js API routes that proxy requests to the backend:

- `/api/blocks` - Blocks data with fallback
- `/api/chain` - Chain statistics with fallback
- `/api/extrinsics` - Extrinsics data
- `/api/search` - Search functionality
- `/api/health` - System health check

These routes provide:

- **Timeout handling** (5s for backend requests)
- **Automatic fallback** to external APIs
- **Consistent response format**
- **Error handling** with appropriate HTTP status codes

## Development Workflow

### 1. Start Backend Server (SQLite - Zero Config!)

```bash
cd server/
npm run setup  # One-time setup (creates .env and data directory)
npm run dev    # Start with SQLite database
# Server starts on http://localhost:3001 with auto-created SQLite database
```

### 2. Start Frontend

```bash
cd web/
npm run dev
# Frontend starts on http://localhost:3000
```

### 3. Verify Integration

- Visit `http://localhost:3000`
- Check browser console for API connection logs
- Use browser DevTools Network tab to monitor API calls
- Check `/api/health` endpoint for system status

## Troubleshooting

### Backend Connection Issues

1. **Check environment variables:**

```bash
echo $NEXT_PUBLIC_API_BASE_URL
echo $NEXT_PUBLIC_WS_URL
```

2. **Verify backend server is running:**

```bash
curl http://localhost:3001/health
```

3. **Check browser console for errors:**

- Look for "Backend is not available" warnings
- Check for CORS errors
- Verify API request/response logs

### Common Issues

#### CORS Errors

Ensure backend CORS configuration allows frontend origin:

```typescript
// Backend CORS config should include
origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
```

#### WebSocket Connection Failures

- Check firewall settings
- Verify WebSocket URL is correct
- Ensure backend WebSocket server is enabled

#### API Timeout Issues

- Check backend server performance
- Monitor network connectivity
- Consider increasing timeout in API client

## Production Deployment

### Environment Variables

Set all required environment variables in your deployment platform:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
NEXT_PUBLIC_NODE_ENV=production
```

### Backend Health Monitoring

The `/api/health` endpoint provides comprehensive system status:

- Frontend service status
- Backend API connectivity
- Database connection status
- Redis cache status
- WebSocket availability

Monitor this endpoint for production health checks.

## Performance Considerations

### Caching Strategy

- Chain data: 30s refresh interval
- Blocks: 6s refresh interval
- Validators: 5min refresh interval
- Analytics: 1min refresh interval

### Request Optimization

- Automatic debouncing for search queries (300ms)
- Request deduplication for identical calls
- Graceful error handling with exponential backoff

### WebSocket Optimization

- Automatic reconnection with backoff
- Selective topic subscription
- Message parsing error handling

## Security Notes

### API Keys

- Store sensitive API keys server-side only
- Frontend should only have public configuration
- Use environment-specific keys

### CORS Configuration

- Restrict CORS origins in production
- Validate all incoming requests
- Implement rate limiting

### Error Handling

- Avoid exposing internal errors to client
- Log detailed errors server-side
- Provide user-friendly error messages
