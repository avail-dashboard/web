import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is required but not set')
}

export async function GET() {
  try {
    // Fetch from backend API only
    const backendResponse = await fetch(`${API_BASE_URL}/chain/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // Increased timeout since we're not using fallback
    })

    if (backendResponse.ok) {
      const backendData = await backendResponse.json()
      console.log('✅ Backend response received:', backendData)
      return NextResponse.json(backendData)
    }

    // If backend fails, return error instead of fallback
    throw new Error(`Backend API error: ${backendResponse.status}`)
  } catch (error) {
    console.error('❌ Chain stats API error:', error)

    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        return NextResponse.json(
          {
            success: false,
            error: 'Request timeout - backend server may be unavailable',
          },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch chain statistics',
      },
      { status: 500 }
    )
  }
}
