import { NextResponse } from 'next/server'

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// Auto-granularity mapping
const AUTO_GRANULARITY_MAP: Record<string, string> = {
  '1h': '5min',
  '6h': '15min',
  '24h': 'hour',
  '7d': 'hour',
  '30d': 'day',
  '90d': 'day'
}

// Validate time range
function validateTimeRange(duration: string, startTime?: string, endTime?: string) {
  if (duration === 'custom') {
    if (!startTime || !endTime) {
      throw new Error('start_time and end_time are required when duration=custom')
    }
    
    const start = new Date(startTime)
    const end = new Date(endTime)
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format for start_time or end_time')
    }
    
    if (end <= start) {
      throw new Error('end_time must be after start_time')
    }
    
    // Max 1 year range
    const maxRange = 365 * 24 * 60 * 60 * 1000 // 1 year in ms
    if (end.getTime() - start.getTime() > maxRange) {
      throw new Error('Time range cannot exceed 1 year')
    }
  }
}

// Validate metric type
function validateMetricType(metricType: string) {
  const validMetrics = [
    'data_volume',
    'submission_count', 
    'success_rate',
    'avg_size',
    'block_utilization',
    'unique_apps',
    'avg_block_time'
  ]
  
  if (!validMetrics.includes(metricType)) {
    throw new Error(`Invalid metric_type. Must be one of: ${validMetrics.join(', ')}`)
  }
}

// Parse array parameters
function parseArrayParam(param: string | null): string[] {
  if (!param) return []
  return param.split(',').filter(Boolean)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract parameters
    const duration = searchParams.get('duration') || '24h'
    const startTime = searchParams.get('start_time')
    const endTime = searchParams.get('end_time')
    const granularityParam = searchParams.get('granularity') || 'auto'
    const metricType = searchParams.get('metric_type') || 'data_volume'
    const groupBy = searchParams.get('group_by') || 'time'
    const appIds = parseArrayParam(searchParams.get('app_ids'))
    const rollupIds = parseArrayParam(searchParams.get('rollup_ids'))
    const sizeRange = searchParams.get('size_range')
    const minSize = searchParams.get('min_size')
    const maxSize = searchParams.get('max_size')
    const successOnly = searchParams.get('success_only') === 'true'
    const limit = Math.min(parseInt(searchParams.get('limit') || '1000'), 5000) // Increased default and max limits

    // Validate inputs
    validateTimeRange(duration, startTime || undefined, endTime || undefined)
    validateMetricType(metricType)

    // Determine granularity
    const granularity = granularityParam === 'auto' 
      ? AUTO_GRANULARITY_MAP[duration] || 'hour'
      : granularityParam

    // Try to fetch from backend first if available
    if (BACKEND_API_URL) {
      try {
        // Build backend request parameters
        const backendParams = new URLSearchParams({
          duration,
          granularity,
          metric_type: metricType,
          group_by: groupBy,
          success_only: successOnly.toString(),
          limit: limit.toString()
        })

        if (startTime) backendParams.append('start_time', startTime)
        if (endTime) backendParams.append('end_time', endTime)
        if (sizeRange) backendParams.append('size_range', sizeRange)
        if (minSize) backendParams.append('min_size', minSize)
        if (maxSize) backendParams.append('max_size', maxSize)
        
        // Add array parameters
        appIds.forEach(id => backendParams.append('app_ids', id))
        rollupIds.forEach(id => backendParams.append('rollup_ids', id))

        const backendUrl = `${BACKEND_API_URL}/data-submissions/charts/data?${backendParams}`
        console.log('🔄 Fetching chart data from backend URL:', backendUrl)

        const backendResponse = await fetch(backendUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout for chart data
        })

        console.log('📡 Backend chart response status:', backendResponse.status)

        if (backendResponse.ok) {
          const data = await backendResponse.json()
          console.log('✅ Backend chart data received, data points:', data.data?.length)
          return NextResponse.json(data)
        }
      } catch (backendError) {
        console.log('⚠️ Backend not available for chart data, using fallback')
      }
    }

    // Fallback to mock data
    const mockData = generateMockChartData(duration, granularity, metricType, limit)
    
    return NextResponse.json({
      ...mockData,
      meta: {
        ...mockData.metadata,
        source: BACKEND_API_URL ? 'fallback' : 'mock',
        warning: BACKEND_API_URL ? 'Backend not available, returning mock data' : 'Using mock data'
      }
    })
  } catch (error) {
    console.error('❌ Chart data API error:', error)

    if (error instanceof Error) {
      // Return validation errors as 400 Bad Request
      if (error.message.includes('Invalid') || error.message.includes('required')) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: error.message,
              timestamp: new Date().toISOString()
            }
          },
          { status: 400 }
        )
      }

      if (error.name === 'TimeoutError') {
        console.error('❌ Chart data timeout error')
        return NextResponse.json(
          {
            error: {
              code: 'TIMEOUT_ERROR',
              message: 'Request timeout - backend server may be slow',
              timestamp: new Date().toISOString()
            }
          },
          { status: 503 }
        )
      }

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('❌ Chart data network error')
        return NextResponse.json(
          {
            error: {
              code: 'NETWORK_ERROR',
              message: 'Network error - cannot reach backend server',
              timestamp: new Date().toISOString()
            }
          },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch chart data',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}

// Generate mock data for development/fallback
function generateMockChartData(duration: string, granularity: string, metricType: string, limit: number) {
  const now = new Date()
  const dataPoints: any[] = []
  
  // Calculate time intervals
  const intervalMs = getIntervalMs(granularity)
  const totalDurationMs = getDurationMs(duration)
  const pointCount = Math.min(Math.floor(totalDurationMs / intervalMs), limit)
  
  console.log(`🎯 Generating ${pointCount} mock data points for ${duration} with ${granularity} granularity`)
  
  // Common app IDs to simulate realistic data
  const commonAppIds = ['0x123abc', '0x456def', '0x789ghi', '0xabc123', '0xdef456']
  
  for (let i = 0; i < pointCount; i++) {
    const timestamp = new Date(now.getTime() - (pointCount - i - 1) * intervalMs)
    const baseValue = getBaseValueForMetric(metricType)
    const variation = 0.8 + Math.random() * 0.4 // ±20% variation
    const appId = commonAppIds[Math.floor(Math.random() * commonAppIds.length)]
    
    dataPoints.push({
      timestamp: timestamp.toISOString(),
      value: Math.floor(baseValue * variation),
      count: Math.floor(20 + Math.random() * 30),
      success_rate: 0.9 + Math.random() * 0.1,
      metadata: {
        app_id: appId,
        app_name: `App ${appId.slice(-3)}`,
        block_height: 1500000 + i * 10,
        avg_submission_size: Math.floor(1000 + Math.random() * 5000)
      }
    })
  }
  
  return {
    data: dataPoints,
    summary: {
      total_data_volume: dataPoints.reduce((sum, d) => sum + d.value, 0),
      total_submissions: dataPoints.reduce((sum, d) => sum + d.count, 0),
      unique_applications: Math.floor(Math.random() * 50) + 10,
      success_rate: 0.92,
      period_growth: 0.15,
      time_range: {
        start: dataPoints[0]?.timestamp,
        end: dataPoints[dataPoints.length - 1]?.timestamp
      },
      block_range: {
        start_block: 1500000,
        end_block: 1500000 + pointCount * 10
      }
    },
    metadata: {
      granularity,
      metric_type: metricType,
      group_by: 'time',
      applied_filters: {},
      data_points: dataPoints.length,
      is_real_time: false
    }
  }
}

function getIntervalMs(granularity: string): number {
  const intervals: Record<string, number> = {
    '5min': 5 * 60 * 1000,
    '15min': 15 * 60 * 1000,
    'hour': 60 * 60 * 1000,
    'day': 24 * 60 * 60 * 1000,
    'week': 7 * 24 * 60 * 60 * 1000,
    'month': 30 * 24 * 60 * 60 * 1000
  }
  return intervals[granularity] || intervals.hour
}

function getDurationMs(duration: string): number {
  const durations: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000
  }
  return durations[duration] || durations['24h']
}

function getBaseValueForMetric(metricType: string): number {
  const baseValues: Record<string, number> = {
    'data_volume': 50000000, // 50MB
    'submission_count': 100,
    'success_rate': 0.92,
    'avg_size': 2048,
    'block_utilization': 0.75,
    'unique_apps': 25,
    'avg_block_time': 20
  }
  return baseValues[metricType] || 1000
}