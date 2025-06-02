# Backend API Issues Report

**Date:** June 2, 2025  
**Reporter:** Frontend Team  
**Priority:** High

## Summary

The Data Submissions page was showing empty numbers (zeros) because the backend API has a critical issue with the `/api/data-submissions/stats` endpoint.

## Issue Details

### 🔴 **CRITICAL: Stats Endpoint Failing**

**Endpoint:** `https://api.avail.naxatar.com/api/data-submissions/stats`  
**Status:** 500 Internal Server Error  
**Impact:** All statistics show as zero on the frontend

#### Error Response:

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Failed to fetch data submission statistics"
  }
}
```

#### Technical Details:

- **Server:** nginx/1.26.0 (Ubuntu)
- **IP:** 159.203.17.255
- **SSL:** Valid (Let's Encrypt certificate)
- **Response Time:** ~200ms
- **Content-Type:** application/json; charset=utf-8

### ✅ **Working: Data Submissions Endpoint**

**Endpoint:** `https://api.avail.naxatar.com/api/data-submissions`  
**Status:** 200 OK  
**Impact:** Data submissions list works correctly

#### Sample Response:

```json
{
  "success": true,
  "data": [
    {
      "extrinsicId": "1000000-0",
      "blockNumber": 1000000,
      "extrinsicIndex": 0,
      "appId": 25,
      "size": 81459,
      "dataHash": "0x000000000000000000000000000000000000000000000000000bd0f1f8edb4b9",
      "submitter": "0x0000000000000000000000000000bd6d6f9b108e",
      "timestamp": 1748848936460,
      "success": true
    }
    // ... more entries
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "source": "rpc"
  }
}
```

## Expected Stats Response Format

The frontend expects the stats endpoint to return:

```json
{
  "success": true,
  "data": {
    "totalSubmissions": 1247,
    "totalDataSize": 52428800,
    "uniqueApps": 23,
    "averageSize": 42048,
    "uniqueSubmitters": 156,
    "submissionsToday": 45,
    "dataSizeToday": 2097152
  },
  "meta": {
    "source": "rpc"
  }
}
```

## Frontend Changes Made

To help with debugging, we've updated the frontend to:

1. **Remove fallback data** - No more sample data masking the real errors
2. **Proper error handling** - API errors are now properly propagated
3. **Better error messages** - Clear indication when backend is unavailable
4. **Timeout handling** - 5-second timeout with specific error messages

## Action Items for Backend Team

### 🚨 **Immediate (Critical)**

1. **Fix the `/api/data-submissions/stats` endpoint**
   - Investigate the internal server error
   - Check database connectivity
   - Verify data aggregation logic
   - Test the endpoint thoroughly

### 📊 **Data Requirements**

The stats endpoint should calculate and return:

- `totalSubmissions`: Total count of all data submissions
- `totalDataSize`: Sum of all submission sizes (in bytes)
- `uniqueApps`: Count of distinct app IDs
- `averageSize`: Average submission size (totalDataSize / totalSubmissions)
- `uniqueSubmitters`: Count of distinct submitter addresses
- `submissionsToday`: Count of submissions in the last 24 hours
- `dataSizeToday`: Sum of submission sizes in the last 24 hours

### 🔍 **Investigation Steps**

1. Check server logs for the stats endpoint
2. Verify database queries for aggregation
3. Test with sample data
4. Ensure proper error handling
5. Add monitoring/alerting for this endpoint

### 📈 **Monitoring**

- Set up health checks for the stats endpoint
- Add metrics for response times
- Monitor error rates
- Alert on 500 errors

## Testing

Once fixed, please test:

```bash
# Should return 200 with proper data structure
curl -v https://api.avail.naxatar.com/api/data-submissions/stats

# Should handle pagination
curl -v "https://api.avail.naxatar.com/api/data-submissions?page=1&limit=10"
```

## Contact

For questions about this issue:

- Frontend Team: [Your contact info]
- This report: `AI Documentation/BACKEND_API_ISSUES.md`

---

**Status:** 🔴 Open - Waiting for backend fix  
**Last Updated:** June 2, 2025
