import { NextResponse } from 'next/server'

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

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
      url: BACKEND_API_URL,
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
    const backendResponse = await fetch(
      `${BACKEND_API_URL.replace('/api', '')}/health`,
      {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      }
    )

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
