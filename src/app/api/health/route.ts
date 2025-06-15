import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
if (!API_BASE_URL) {
  throw new Error(
    'NEXT_PUBLIC_API_BASE_URL environment variable is required but not set'
  )
}

export async function GET() {
  const timestamp = new Date().toISOString()
  const health = {
    frontend: {
      status: 'healthy',
      timestamp,
      version: '1.0.0',
    },
    backend: {
      status: 'unknown',
      available: false,
      url: API_BASE_URL,
      error: null as string | null,
    },
    services: {
      websocket: { enabled: false },
      caching: { connected: false, ping: null, note: 'Not connected' },
      database: { connected: false, note: 'Not connected' },
    },
  }

  try {
    // Check backend health
    console.log('🔍 Checking backend health at:', `${API_BASE_URL}/health`)
    const backendResponse = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    })

    console.log('📡 Backend response status:', backendResponse.status)
    if (backendResponse.ok) {
      const backendHealth = await backendResponse.json()
      console.log('✅ Backend is healthy')
      health.backend.status = 'healthy'
      health.backend.available = true

      // Extract service status if available
      if (backendHealth.data && backendHealth.data.services) {
        health.services = { ...health.services, ...backendHealth.data.services }
      }
    } else {
      console.log('❌ Backend returned error status:', backendResponse.status)
      health.backend.status = 'unhealthy'
      health.backend.error = `HTTP ${backendResponse.status}`
    }
  } catch (error) {
    console.log('💥 Backend check failed with error:', error)
    health.backend.status = 'unreachable'
    health.backend.error =
      error instanceof Error ? error.message : 'Unknown error'
  }

  // Determine overall status
  const overallStatus = health.backend.available ? 'healthy' : 'degraded'

  return NextResponse.json(
    {
      success: true,
      data: {
        status: overallStatus,
        timestamp,
        uptime: process.uptime(),
        version: '1.0.0',
        environment: process.env.NODE_ENV!,
        services: health.services,
      },
      backend: health.backend, // Include backend status for frontend status checks
      timestamp,
    },
    {
      status: overallStatus === 'healthy' ? 200 : 503,
    }
  )
}
