import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is required but not set')
}

export async function GET() {
  const health = {
    frontend: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
    backend: {
      status: 'unknown',
      available: false,
      url: API_BASE_URL,
      error: null as string | null,
    },
    services: {
      websocket: false,
      caching: false,
      database: false,
    },
  }

  try {
    // Check backend health
    const backendResponse = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    })

    if (backendResponse.ok) {
      const backendHealth = await backendResponse.json()
      health.backend.status = 'healthy'
      health.backend.available = true

      // Extract service status if available
      if (backendHealth.services) {
        health.services = { ...health.services, ...backendHealth.services }
      }
    } else {
      health.backend.status = 'unhealthy'
      health.backend.error = `HTTP ${backendResponse.status}`
    }
  } catch (error) {
    health.backend.status = 'unreachable'
    health.backend.error =
      error instanceof Error ? error.message : 'Unknown error'
  }

  // Determine overall status
  const overallStatus = health.backend.available ? 'healthy' : 'degraded'

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      ...health,
    },
    {
      status: overallStatus === 'healthy' ? 200 : 503,
    }
  )
}
