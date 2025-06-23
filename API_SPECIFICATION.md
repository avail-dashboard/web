# Avail DA Explorer Chart API Specification

## Overview

This API provides flexible, high-performance chart data for the Avail Data Availability Explorer. Designed to surpass Subscan's limitations with dynamic aggregation, real-time capabilities, and Avail-specific metrics.

## Base URL

```
/api/data-submissions/charts
```

## Core Design Principles

1. **Performance First**: Chart-optimized responses (max 1000 data points)
2. **Flexible Aggregation**: Any time granularity vs Subscan's fixed daily
3. **Avail-Specific**: DA layer metrics not available elsewhere
4. **Real-time Ready**: WebSocket support for live updates
5. **Smart Defaults**: Auto-optimization based on time range

## Endpoints

### 1. Chart Data API

```http
GET /api/data-submissions/charts/data
```

**Query Parameters:**

| Parameter      | Type       | Default       | Description                           |
| -------------- | ---------- | ------------- | ------------------------------------- |
| `duration`     | string     | `24h`         | `1h\|6h\|24h\|7d\|30d\|90d\|custom`   |
| `start_time`   | ISO string | -             | Required if duration=custom           |
| `end_time`     | ISO string | -             | Required if duration=custom           |
| `granularity`  | string     | `auto`        | `5min\|hour\|day\|week\|month\|auto`  |
| `metric_type`  | string     | `data_volume` | See metrics table below               |
| `group_by`     | string     | `time`        | `time\|app_id\|rollup_id\|size_range` |
| `app_ids[]`    | array      | -             | Filter by specific application IDs    |
| `rollup_ids[]` | array      | -             | Filter by rollup identifiers          |
| `size_range`   | string     | -             | `small\|medium\|large\|custom`        |
| `min_size`     | number     | -             | Minimum data size (bytes)             |
| `max_size`     | number     | -             | Maximum data size (bytes)             |
| `success_only` | boolean    | `false`       | Filter successful submissions only    |
| `limit`        | number     | `100`         | Max data points (1-1000)              |

**Supported Metrics:**

| Metric Type         | Description             | Unit       | Aggregation    |
| ------------------- | ----------------------- | ---------- | -------------- |
| `data_volume`       | Total data submitted    | bytes      | sum            |
| `submission_count`  | Number of submissions   | count      | count          |
| `success_rate`      | Submission success rate | percentage | avg            |
| `avg_size`          | Average submission size | bytes      | avg            |
| `block_utilization` | Block space usage       | percentage | avg            |
| `unique_apps`       | Unique applications     | count      | count_distinct |
| `avg_block_time`    | Average block time      | seconds    | avg            |

**Auto-Granularity Logic:**

- `1h` → `5min`
- `6h` → `15min`
- `24h` → `hour`
- `7d` → `hour`
- `30d` → `day`
- `90d` → `day`

**Response Format:**

```json
{
  "data": [
    {
      "timestamp": "2024-01-01T00:00:00Z",
      "value": 1234567,
      "count": 45,
      "success_rate": 0.95,
      "metadata": {
        "app_id": "0x123abc",
        "app_name": "Example DApp",
        "rollup_id": "arbitrum_1",
        "block_height": 123456,
        "avg_submission_size": 2048
      }
    }
  ],
  "summary": {
    "total_data_volume": 1234567890,
    "total_submissions": 1000,
    "unique_applications": 25,
    "success_rate": 0.92,
    "period_growth": 0.15,
    "time_range": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-01T23:59:59Z"
    },
    "block_range": {
      "start_block": 123400,
      "end_block": 123500
    }
  },
  "metadata": {
    "granularity": "hour",
    "metric_type": "data_volume",
    "group_by": "time",
    "applied_filters": {
      "app_ids": ["0x123abc"],
      "success_only": false,
      "size_range": "medium"
    },
    "data_points": 24,
    "is_real_time": false
  }
}
```

### 2. Chart Configuration API

```http
GET /api/data-submissions/charts/config
```

Returns available filter options for dropdowns.

**Response:**

```json
{
  "applications": [
    {
      "app_id": "0x123abc",
      "name": "Example DApp",
      "submission_count": 1000,
      "last_active": "2024-01-01T12:00:00Z"
    }
  ],
  "rollups": [
    {
      "rollup_id": "arbitrum_1",
      "name": "Arbitrum One",
      "submission_count": 500
    }
  ],
  "size_ranges": {
    "small": { "min": 0, "max": 1024 },
    "medium": { "min": 1024, "max": 1048576 },
    "large": { "min": 1048576, "max": null }
  },
  "available_metrics": [
    {
      "key": "data_volume",
      "name": "Data Volume",
      "description": "Total bytes of data submitted",
      "unit": "bytes",
      "chart_types": ["line", "area", "bar"]
    }
  ],
  "time_ranges": [
    { "key": "1h", "name": "1 Hour", "granularity": "5min" },
    { "key": "24h", "name": "24 Hours", "granularity": "hour" },
    { "key": "7d", "name": "7 Days", "granularity": "hour" },
    { "key": "30d", "name": "30 Days", "granularity": "day" }
  ]
}
```

### 3. Real-time Updates API

```http
GET /api/data-submissions/charts/realtime
```

**Query Parameters:**

- `subscribe_to`: `new_submissions|block_updates|all`
- `app_ids[]`: Filter updates by application

**WebSocket Upgrade:**

```
ws://localhost:3000/api/data-submissions/charts/realtime
```

**WebSocket Messages:**

```json
{
  "type": "new_submission",
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    "app_id": "0x123abc",
    "size": 2048,
    "block_height": 123457,
    "success": true
  }
}
```

### 4. Comparative Analytics API

```http
GET /api/data-submissions/charts/compare
```

**Query Parameters:**

- `periods[]`: Array of time periods to compare
- `metric_type`: Metric to compare
- `compare_type`: `time_periods|applications|rollups`

**Example:**

```
GET /api/data-submissions/charts/compare?periods[]=7d&periods[]=14d&metric_type=data_volume&compare_type=time_periods
```

**Response:**

```json
{
  "comparison": [
    {
      "period": "7d",
      "label": "Last 7 Days",
      "total_value": 1000000,
      "average_daily": 142857,
      "growth_rate": 0.15
    },
    {
      "period": "14d",
      "label": "Previous 7 Days",
      "total_value": 800000,
      "average_daily": 114285,
      "growth_rate": -0.05
    }
  ],
  "summary": {
    "best_performing": "7d",
    "growth_trend": "increasing",
    "variance": 0.23
  }
}
```

### 5. Export API

```http
GET /api/data-submissions/charts/export
```

**Query Parameters:**

- Same as chart data API
- `format`: `csv|json|xlsx`

**Response:**

- CSV/Excel file download
- JSON with export metadata

## Error Handling

**Standard Error Response:**

```json
{
  "error": {
    "code": "INVALID_TIME_RANGE",
    "message": "End time must be after start time",
    "details": {
      "field": "end_time",
      "received": "2024-01-01T00:00:00Z",
      "expected": "After 2024-01-02T00:00:00Z"
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Error Codes:**

- `INVALID_TIME_RANGE`: Invalid time parameters
- `INVALID_GRANULARITY`: Unsupported granularity for time range
- `INVALID_METRIC`: Unknown metric type
- `TOO_MANY_DATA_POINTS`: Exceeds limit (>1000)
- `INVALID_APP_ID`: Unknown application ID
- `RATE_LIMITED`: Too many requests

## Rate Limiting

- **Chart Data API**: 100 requests/minute
- **Config API**: 20 requests/minute
- **Real-time API**: 10 connections per IP
- **Export API**: 5 requests/minute

Headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Caching Strategy

- **Chart Data**: 5 minutes for recent data (< 1 hour old)
- **Config Data**: 1 hour
- **Historical Data**: 24 hours (> 7 days old)
- **Real-time**: No caching

## Implementation Examples

### Basic Time Series Chart

```javascript
// Fetch last 24 hours of data volume
const response = await fetch(
  '/api/data-submissions/charts/data?duration=24h&metric_type=data_volume'
)
const chartData = await response.json()

// Use with Chart.js
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: chartData.data.map(d => d.timestamp),
    datasets: [
      {
        label: 'Data Volume',
        data: chartData.data.map(d => d.value),
      },
    ],
  },
})
```

### Application Comparison

```javascript
// Compare top 5 applications
const response = await fetch(
  '/api/data-submissions/charts/data?duration=7d&group_by=app_id&limit=5'
)
const appData = await response.json()

// Create grouped bar chart
const chart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: appData.data.map(d => d.metadata.app_name),
    datasets: [
      {
        label: 'Data Volume (7 days)',
        data: appData.data.map(d => d.value),
      },
    ],
  },
})
```

### Real-time Updates

```javascript
const ws = new WebSocket(
  'ws://localhost:3000/api/data-submissions/charts/realtime'
)

ws.onmessage = event => {
  const update = JSON.parse(event.data)
  if (update.type === 'new_submission') {
    // Update chart with new data point
    addDataToChart(chart, update.data)
  }
}
```

## Frontend Integration

### Chart Component Props

```typescript
interface ChartProps {
  duration: '1h' | '6h' | '24h' | '7d' | '30d' | '90d' | 'custom'
  startTime?: string
  endTime?: string
  granularity?: 'auto' | '5min' | 'hour' | 'day' | 'week' | 'month'
  metricType: 'data_volume' | 'submission_count' | 'success_rate' | 'avg_size'
  groupBy?: 'time' | 'app_id' | 'rollup_id'
  appIds?: string[]
  rollupIds?: string[]
  sizeRange?: 'small' | 'medium' | 'large'
  successOnly?: boolean
  realTime?: boolean
}
```

### URL State Management

```
/data-submissions?duration=7d&metric=data_volume&granularity=hour&apps=0x123,0x456
```

## Performance Optimizations

1. **Database Indexing**:

   - `(timestamp, app_id)`
   - `(timestamp, success_status)`
   - `(app_id, timestamp)`

2. **Query Optimization**:

   - Pre-aggregated materialized views for common queries
   - Connection pooling
   - Query result caching

3. **Response Optimization**:
   - GZIP compression
   - CDN caching for static config data
   - Streaming for large exports

## Security Considerations

1. **Input Validation**:

   - Timestamp range limits (max 1 year)
   - SQL injection prevention
   - App ID format validation

2. **Rate Limiting**:

   - Per-IP and per-API key limits
   - Progressive backoff

3. **Data Privacy**:
   - No sensitive account data in responses
   - Anonymized validator information

## Monitoring & Analytics

**Metrics to Track**:

- API response times
- Cache hit rates
- WebSocket connection counts
- Most requested time ranges
- Popular metric combinations

**Alerts**:

- API response time > 2 seconds
- Cache miss rate > 20%
- Error rate > 5%
- WebSocket connection failures

This API specification provides a comprehensive foundation for building advanced charting capabilities that significantly exceed Subscan's current offerings while maintaining optimal performance and user experience.
