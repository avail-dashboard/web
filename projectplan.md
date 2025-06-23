# Data Submissions Chart API Design Plan

## Problem Statement

Currently, the charts on the data submissions page use the same API response as the table (fixed 82 items). We need to design a separate, flexible API that supports typical dashboard chart functionalities:

- Duration selection (time ranges)
- Granularity control (hourly, daily, weekly, monthly)
- Different metric types
- Performance optimization for charts

## Avail Context & Entities

**Avail** is a specialized blockchain designed as a Data Availability (DA) layer. Key entities relevant to our charts:

- **Data Submissions**: Applications submit data via `submit_data` extrinsic to Avail
- **Application Keys/IDs**: Unique identifiers for each application submitting data
- **Blocks**: Contain submitted data organized in a matrix with Kate polynomial commitments
- **Rollups**: Layer 2 scaling solutions that use Avail for data availability
- **Data Size**: Volume of data submitted per block/application (measured in bytes)
- **Success Rate**: Percentage of successful data submissions vs failed attempts

**Data Flow**: Applications → Data Submissions → Blocks → DA Proofs → Light Client Verification

## Analysis of Current State

- **Current API**: `/api/data-submissions` returns fixed paginated results
- **Chart Component**: `DataSubmissionsChart.tsx` uses table data directly
- **Missing**: Time-based filtering, aggregation options, chart-optimized responses

## Proposed API Design

### 1. Core Chart Data API

```
GET /api/data-submissions/charts/data
```

**Query Parameters:**

- `duration`: `1h|6h|24h|7d|30d|90d|custom`
- `start_time`: ISO timestamp (for custom duration)
- `end_time`: ISO timestamp (for custom duration)
- `granularity`: `hour|day|week|month|auto` (auto-selects based on duration)
- `metric_type`: `data_volume|submission_count|success_rate|avg_size|block_utilization`
- `group_by`: `time|app_id|rollup_id|block_height|data_size_range`
- `app_ids[]`: Array of application IDs for filtering
- `rollup_ids[]`: Array of rollup IDs for filtering (if applicable)
- `size_range`: `small|medium|large|custom` (for data size categorization)
- `success_only`: `true|false` (filter successful submissions only)
- `limit`: Max data points (default: 100, max: 1000)

**Response:**

```json
{
  "data": [
    {
      "timestamp": "2024-01-01T00:00:00Z",
      "value": 1234567,
      "count": 45,
      "success_rate": 0.95,
      "block_height": 123456,
      "metadata": {
        "app_id": "0x123abc",
        "app_name": "Example DApp",
        "rollup_id": "arbitrum_1",
        "avg_submission_size": 2048
      }
    }
  ],
  "summary": {
    "total_data_volume": 1234567890,
    "total_submissions": 1000,
    "unique_applications": 25,
    "success_rate": 0.92,
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
      "success_only": false
    }
  }
}
```

### 2. Real-time Updates API

```
GET /api/data-submissions/charts/realtime
WebSocket: /ws/data-submissions/charts
```

### 3. Chart Configuration API

```
GET /api/data-submissions/charts/config
```

Returns available options for dropdowns (rollups, apps, time ranges)

### 4. Comparative Analytics API

```
GET /api/data-submissions/charts/compare
```

For comparing different time periods or rollups

## Implementation Todo List

### Phase 1: Basic Chart API

- [ ] Create `/api/data-submissions/charts/data` endpoint
- [ ] Implement time-based filtering logic
- [ ] Add granularity aggregation
- [ ] Support basic metric types (volume, count)
- [ ] Update chart component to use new API
- [ ] Add loading states and error handling

### Phase 2: Advanced Features

- [ ] Implement group_by functionality
- [ ] Add success rate and performance metrics
- [ ] Create chart configuration endpoint
- [ ] Add real-time WebSocket updates
- [ ] Implement comparative analytics

### Phase 3: Optimization

- [ ] Add response caching
- [ ] Optimize database queries
- [ ] Add request rate limiting
- [ ] Performance testing and tuning

## Design Principles

1. **Flexibility**: API should support various chart types and configurations
2. **Performance**: Optimized for chart rendering (limited data points)
3. **Consistency**: Follow existing API patterns in codebase
4. **Real-time**: Support live updates for dashboard experience
5. **Simplicity**: Each endpoint has single responsibility

## Subscan Analysis & Comparison

After reviewing `avail.subscan.io`, here's what they implement:

### What Subscan Has:

1. **Data Submission List**: Table with Extrinsic ID, App ID, Size, Submit by, Data Hash
2. **Time Filters**: 1H, 6H, 1D buttons for quick filtering
3. **Chart Types**:
   - Daily Data Submissions Number
   - Daily Data Submissions Size
4. **Statistics**: Total Data (45.059 GB), total submissions count (159,023)
5. **Pagination**: 25 items per page with navigation
6. **Download**: Export functionality for table data

### What We Should Improve On:

1. **More Granular Time Controls**: Hour/day/week/month + custom ranges
2. **Advanced Filtering**: By App ID, size ranges, success status
3. **Better Chart Interactivity**: Zoom, pan, multiple time series
4. **Real-time Updates**: Live data feeds vs static snapshots
5. **Comparative Analytics**: Compare time periods, rollups, applications
6. **Performance Metrics**: Success rates, average sizes, trends

### Our API Advantage:

- **Flexible Aggregation**: Any time granularity vs fixed daily
- **Multiple Metrics**: Volume, count, success rate, block utilization
- **Smart Grouping**: By time, app, rollup, size ranges
- **Chart-Optimized**: Limited data points for smooth rendering
- **Real-time Ready**: WebSocket support for live updates

## Updated Questions for Review

1. Should we match Subscan's simple 1H/6H/1D filters or go full flexible?
2. Do you want real-time updates or is periodic refresh sufficient?
3. Which chart types are priority: time series, bar charts, or both?
4. Should we support data export like Subscan's download feature?
5. Do you need app-specific dashboards or just global views?

---

_This plan now incorporates learnings from Subscan while staying focused on our superior flexibility and performance approach._
