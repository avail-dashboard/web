# Avail Data Submissions Chart API Specification

## Overview

This document specifies the backend API endpoints required to support the enhanced data submissions chart functionality in the Avail Explorer dashboard. The API should provide flexible, high-performance chart data with support for large datasets, multiple aggregation methods, and various filtering options.

## Base URL

```
https://api.avail.naxatar.com/api
```

## Endpoints

### 1. Chart Configuration API

**Endpoint**: `GET /data-submissions/charts/config`

**Purpose**: Provides metadata about available chart options, applications, metrics, and system limits.

**Response Format**:

```json
{
  "applications": [
    {
      "app_id": "string",
      "name": "string",
      "submission_count": "number",
      "last_active": "ISO8601 timestamp"
    }
  ],
  "rollups": [
    {
      "rollup_id": "string",
      "name": "string",
      "submission_count": "number"
    }
  ],
  "available_metrics": [
    {
      "key": "string",
      "name": "string",
      "description": "string",
      "unit": "string",
      "chart_types": ["string"],
      "is_primary": "boolean"
    }
  ],
  "time_ranges": [
    {
      "key": "string",
      "name": "string",
      "granularity": "string",
      "description": "string"
    }
  ],
  "group_by_options": [
    {
      "key": "string",
      "name": "string",
      "description": "string"
    }
  ],
  "chart_types": [
    {
      "key": "string",
      "name": "string",
      "description": "string",
      "recommended_for": ["string"]
    }
  ],
  "default_settings": {
    "duration": "string",
    "granularity": "string",
    "metric_type": "string",
    "group_by": "string",
    "chart_type": "string",
    "success_only": "boolean",
    "limit": "number"
  },
  "limits": {
    "max_data_points": "number",
    "max_time_range_days": "number",
    "max_apps_filter": "number",
    "max_rollups_filter": "number"
  },
  "size_ranges": {
    "small": {
      "min": "number",
      "max": "number",
      "label": "string"
    },
    "medium": {
      "min": "number",
      "max": "number",
      "label": "string"
    },
    "large": {
      "min": "number",
      "max": "number | null",
      "label": "string"
    }
  },
  "meta": {
    "source": "string",
    "last_updated": "ISO8601 timestamp",
    "api_version": "string"
  }
}
```

**Example Response**:

```json
{
  "applications": [
    {
      "app_id": "0x01",
      "name": "Polygon zkEVM",
      "submission_count": 15420,
      "last_active": "2024-06-23T10:30:00Z"
    },
    {
      "app_id": "0x02",
      "name": "Arbitrum Nova",
      "submission_count": 8930,
      "last_active": "2024-06-23T10:25:00Z"
    }
  ],
  "available_metrics": [
    {
      "key": "data_volume",
      "name": "Data Volume",
      "description": "Total bytes of data submitted to Avail DA",
      "unit": "bytes",
      "chart_types": ["line", "area", "bar"],
      "is_primary": true
    },
    {
      "key": "submission_count",
      "name": "Submission Count",
      "description": "Number of data submissions",
      "unit": "count",
      "chart_types": ["line", "bar"],
      "is_primary": true
    },
    {
      "key": "success_rate",
      "name": "Success Rate",
      "description": "Percentage of successful submissions",
      "unit": "percentage",
      "chart_types": ["line", "area"],
      "is_primary": false
    }
  ],
  "time_ranges": [
    {
      "key": "1h",
      "name": "1 Hour",
      "granularity": "5min",
      "description": "Last hour with 5-minute intervals"
    },
    {
      "key": "24h",
      "name": "24 Hours",
      "granularity": "hour",
      "description": "Last 24 hours with hourly intervals"
    },
    {
      "key": "7d",
      "name": "7 Days",
      "granularity": "hour",
      "description": "Last 7 days with hourly intervals"
    },
    {
      "key": "30d",
      "name": "30 Days",
      "granularity": "day",
      "description": "Last 30 days with daily intervals"
    }
  ],
  "limits": {
    "max_data_points": 5000,
    "max_time_range_days": 365,
    "max_apps_filter": 50,
    "max_rollups_filter": 20
  }
}
```

---

### 2. Chart Data API

**Endpoint**: `GET /data-submissions/charts/data`

**Purpose**: Provides aggregated chart data for data submissions with flexible filtering and grouping options.

#### Query Parameters

| Parameter      | Type     | Required    | Description                           | Example                               |
| -------------- | -------- | ----------- | ------------------------------------- | ------------------------------------- |
| `duration`     | string   | No          | Time range key                        | `"24h"`, `"7d"`, `"custom"`           |
| `start_time`   | string   | Conditional | Start time for custom range (ISO8601) | `"2024-06-20T00:00:00Z"`              |
| `end_time`     | string   | Conditional | End time for custom range (ISO8601)   | `"2024-06-23T23:59:59Z"`              |
| `granularity`  | string   | No          | Time interval granularity             | `"auto"`, `"5min"`, `"hour"`, `"day"` |
| `metric_type`  | string   | No          | Metric to aggregate                   | `"data_volume"`, `"submission_count"` |
| `group_by`     | string   | No          | Grouping method                       | `"time"`, `"app_id"`, `"rollup_id"`   |
| `app_ids`      | string[] | No          | Filter by specific App IDs            | `["0x01", "0x02"]`                    |
| `rollup_ids`   | string[] | No          | Filter by specific Rollup IDs         | `["arbitrum_1", "optimism_1"]`        |
| `size_range`   | string   | No          | Filter by submission size             | `"small"`, `"medium"`, `"large"`      |
| `min_size`     | number   | No          | Minimum submission size (bytes)       | `1024`                                |
| `max_size`     | number   | No          | Maximum submission size (bytes)       | `1048576`                             |
| `success_only` | boolean  | No          | Include only successful submissions   | `true`, `false`                       |
| `limit`        | number   | No          | Maximum data points to return         | `1000` (default), `5000` (max)        |

#### Auto-Granularity Mapping

When `granularity=auto`, the backend should use these mappings:

| Duration | Auto Granularity | Expected Data Points |
| -------- | ---------------- | -------------------- |
| `1h`     | `5min`           | 12 points            |
| `6h`     | `15min`          | 24 points            |
| `24h`    | `hour`           | 24 points            |
| `7d`     | `hour`           | 168 points           |
| `30d`    | `day`            | 30 points            |
| `90d`    | `day`            | 90 points            |

#### Response Format

```json
{
  "data": [
    {
      "timestamp": "ISO8601 timestamp",
      "value": "number",
      "count": "number",
      "success_rate": "number (0-1)",
      "metadata": {
        "app_id": "string (if grouped by app)",
        "app_name": "string (if grouped by app)",
        "rollup_id": "string (if grouped by rollup)",
        "block_height": "number",
        "avg_submission_size": "number"
      }
    }
  ],
  "summary": {
    "total_data_volume": "number",
    "total_submissions": "number",
    "unique_applications": "number",
    "success_rate": "number (0-1)",
    "period_growth": "number (percentage change)",
    "time_range": {
      "start": "ISO8601 timestamp",
      "end": "ISO8601 timestamp"
    },
    "block_range": {
      "start_block": "number",
      "end_block": "number"
    }
  },
  "metadata": {
    "granularity": "string",
    "metric_type": "string",
    "group_by": "string",
    "applied_filters": "object",
    "data_points": "number",
    "is_real_time": "boolean"
  }
}
```

#### Example Requests & Responses

**Example 1: Time-based Data Volume (24 hours)**

```
GET /data-submissions/charts/data?duration=24h&metric_type=data_volume&group_by=time&limit=1000
```

Response:

```json
{
  "data": [
    {
      "timestamp": "2024-06-23T00:00:00Z",
      "value": 45234567,
      "count": 234,
      "success_rate": 0.96,
      "metadata": {
        "block_height": 1500120,
        "avg_submission_size": 193245
      }
    },
    {
      "timestamp": "2024-06-23T01:00:00Z",
      "value": 52341789,
      "count": 287,
      "success_rate": 0.94,
      "metadata": {
        "block_height": 1500180,
        "avg_submission_size": 182456
      }
    }
  ],
  "summary": {
    "total_data_volume": 1234567890,
    "total_submissions": 6789,
    "unique_applications": 12,
    "success_rate": 0.95,
    "period_growth": 0.12,
    "time_range": {
      "start": "2024-06-22T10:30:00Z",
      "end": "2024-06-23T10:30:00Z"
    }
  },
  "metadata": {
    "granularity": "hour",
    "metric_type": "data_volume",
    "group_by": "time",
    "applied_filters": {},
    "data_points": 24,
    "is_real_time": false
  }
}
```

**Example 2: App ID Grouped Data**

```
GET /data-submissions/charts/data?duration=7d&metric_type=submission_count&group_by=app_id&limit=3000
```

Response:

```json
{
  "data": [
    {
      "timestamp": "2024-06-17T00:00:00Z",
      "value": 45,
      "count": 45,
      "success_rate": 0.98,
      "metadata": {
        "app_id": "0x01",
        "app_name": "Polygon zkEVM",
        "block_height": 1499000,
        "avg_submission_size": 156789
      }
    },
    {
      "timestamp": "2024-06-17T00:00:00Z",
      "value": 32,
      "count": 32,
      "success_rate": 0.94,
      "metadata": {
        "app_id": "0x02",
        "app_name": "Arbitrum Nova",
        "block_height": 1499000,
        "avg_submission_size": 234567
      }
    }
  ],
  "summary": {
    "total_data_volume": 987654321,
    "total_submissions": 5432,
    "unique_applications": 8,
    "success_rate": 0.93,
    "period_growth": 0.08
  },
  "metadata": {
    "granularity": "hour",
    "metric_type": "submission_count",
    "group_by": "app_id",
    "applied_filters": {},
    "data_points": 1344,
    "is_real_time": false
  }
}
```

**Example 3: Filtered by App ID**

```
GET /data-submissions/charts/data?duration=30d&metric_type=data_volume&app_ids=0x01,0x02&granularity=day
```

---

## Data Aggregation Requirements

### 1. Time-based Aggregation (`group_by=time`)

- **Aggregate by time intervals**: Sum/average values within each time bucket
- **Fill gaps**: Include time periods with zero submissions
- **Sort chronologically**: Return data points in ascending time order
- **Handle timezone**: Use UTC for all timestamps

### 2. App ID Aggregation (`group_by=app_id`)

- **Group by application**: Create separate data series for each App ID
- **Include metadata**: App name, submission counts, last active time
- **Maintain time dimension**: Each app should have time-ordered data points
- **Filter support**: Respect `app_ids` parameter to limit specific apps

### 3. Rollup Aggregation (`group_by=rollup_id`)

- **Group by rollup**: Similar to App ID but for rollup identifiers
- **Cross-reference**: Map App IDs to Rollup IDs where applicable
- **Metadata**: Include rollup names and statistics

## Metric Calculations

### Primary Metrics

1. **data_volume**: Sum of `dataSize` field across submissions
2. **submission_count**: Count of submissions
3. **success_rate**: Ratio of successful submissions to total submissions
4. **avg_size**: Average submission size in bytes
5. **block_utilization**: Percentage of block space used for DA
6. **unique_apps**: Count of distinct App IDs
7. **avg_block_time**: Average time between blocks

### Derived Metrics

- **period_growth**: Percentage change compared to previous period
- **throughput**: Data volume per unit time
- **efficiency**: Success rate weighted by volume

## Performance Requirements

### 1. Response Time

- **Target**: < 2 seconds for most queries
- **Maximum**: < 5 seconds for complex aggregations
- **Large datasets**: < 10 seconds for 5000+ data points

### 2. Caching Strategy

- **Config endpoint**: Cache for 5 minutes
- **Chart data**: Cache for 1-2 minutes based on granularity
- **Real-time data**: No caching for latest data points

### 3. Database Optimization

- **Indexes**: On timestamp, app_id, block_number, success fields
- **Partitioning**: Consider time-based partitioning for large tables
- **Aggregation tables**: Pre-computed hourly/daily aggregates for performance

## Error Handling

### HTTP Status Codes

- **200 OK**: Successful response
- **400 Bad Request**: Invalid parameters
- **422 Unprocessable Entity**: Valid parameters but logical errors
- **429 Too Many Requests**: Rate limiting
- **500 Internal Server Error**: Server errors
- **503 Service Unavailable**: Temporary unavailability

### Error Response Format

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (optional)",
    "timestamp": "ISO8601 timestamp"
  }
}
```

### Common Error Scenarios

1. **Invalid time range**: `end_time` before `start_time`
2. **Exceeds limits**: Requesting more than `max_data_points`
3. **Invalid metric**: Unknown `metric_type`
4. **Invalid granularity**: Unsupported time interval
5. **Too many filters**: Exceeding `max_apps_filter`

## Security & Rate Limiting

### 1. Authentication

- Use existing API authentication mechanism
- Same permissions as regular data submissions endpoint

### 2. Rate Limiting

- **Chart data**: 100 requests per minute per IP
- **Config**: 200 requests per minute per IP
- **Burst allowance**: 20 requests per 10 seconds

### 3. Input Validation

- **SQL injection prevention**: Parameterized queries
- **XSS prevention**: Sanitize all string inputs
- **Range validation**: Validate all numeric parameters

## WebSocket Support (Future Enhancement)

### Real-time Updates Endpoint

```
WSS /data-submissions/charts/subscribe
```

### Message Format

```json
{
  "type": "chart_update",
  "channel": "data_submissions",
  "data": {
    "metric_type": "string",
    "new_data_point": "ChartDataPoint object",
    "summary_update": "partial summary object"
  },
  "timestamp": "ISO8601 timestamp"
}
```

## Implementation Notes

### 1. Database Schema Considerations

```sql
-- Example optimized query for time-based aggregation
SELECT
  DATE_TRUNC('hour', timestamp) as time_bucket,
  SUM(data_size) as total_volume,
  COUNT(*) as submission_count,
  AVG(data_size) as avg_size,
  SUM(CASE WHEN success THEN 1 ELSE 0 END)::float / COUNT(*) as success_rate
FROM data_submissions
WHERE timestamp >= $1 AND timestamp < $2
  AND ($3::text[] IS NULL OR app_id = ANY($3))
GROUP BY time_bucket
ORDER BY time_bucket;
```

### 2. App ID Metadata Join

```sql
-- Include app metadata in response
SELECT
  ds.timestamp,
  ds.app_id,
  apps.name as app_name,
  SUM(ds.data_size) as value,
  COUNT(*) as count
FROM data_submissions ds
LEFT JOIN applications apps ON ds.app_id = apps.app_id
WHERE ds.timestamp >= $1 AND ds.timestamp < $2
GROUP BY ds.timestamp, ds.app_id, apps.name
ORDER BY ds.timestamp, ds.app_id;
```

### 3. Fallback Behavior

- **Backend unavailable**: Frontend falls back to mock data
- **Partial data**: Return available data with metadata indicating completeness
- **Timeout**: Return cached data if available

## Testing Requirements

### 1. Unit Tests

- Parameter validation
- Aggregation logic
- Error handling
- Edge cases (empty datasets, single data points)

### 2. Integration Tests

- Full request/response cycle
- Database integration
- Performance under load
- Cache behavior

### 3. Load Testing

- 1000 concurrent requests
- Large dataset queries (5000+ points)
- Memory usage under load
- Response time degradation

## Monitoring & Logging

### 1. Metrics to Track

- **Request count**: By endpoint and status code
- **Response time**: 95th and 99th percentiles
- **Error rate**: By error type
- **Data points returned**: Track dataset sizes
- **Cache hit rate**: For performance optimization

### 2. Logging Requirements

- **Request logs**: Include parameters and response time
- **Error logs**: Full stack traces for debugging
- **Performance logs**: Slow queries and large datasets
- **User behavior**: Most common parameter combinations

This specification provides the backend team with everything needed to implement a robust, scalable chart data API that supports the enhanced data submissions dashboard functionality.
