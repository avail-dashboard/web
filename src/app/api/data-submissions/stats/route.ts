import { NextResponse } from 'next/server'

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL
if (!BACKEND_API_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is required but not set')
}

export async function GET() {
  try {
    const backendUrl = `${BACKEND_API_URL}/data-submissions/stats`
    console.log('🔄 Fetching stats from backend URL:', backendUrl)

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // Reduced timeout to 5 seconds
    })

    console.log('📡 Backend stats response status:', backendResponse.status)

    if (backendResponse.ok) {
      const data = await backendResponse.json()
      console.log('✅ Backend data submission stats received:', data.data)
      return NextResponse.json(data)
    } else {
      console.error(
        '❌ Backend stats response not OK:',
        backendResponse.status,
        backendResponse.statusText
      )

      // If backend fails, return error instead of mock data
      return NextResponse.json(
        {
          success: false,
          error: `Backend server error: ${backendResponse.status} ${backendResponse.statusText}`,
          data: {
            totalSubmissions: 0,
            totalDataSize: 0,
            uniqueApps: 0,
            uniqueSubmitters: 0,
            averageSize: 0,
            submissionsToday: 0,
            dataSizeToday: 0,
          },
          meta: {
            source: 'error',
          },
        },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('❌ Data submission stats API error:', error)

    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        console.error(
          '❌ Stats timeout error - backend may be slow or unreachable'
        )
        return NextResponse.json(
          {
            success: false,
            error: 'Request timeout - backend server may be unavailable',
            data: null,
          },
          { status: 503 }
        )
      }

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('❌ Stats network error - backend may be unreachable')
        return NextResponse.json(
          {
            success: false,
            error: 'Network error - cannot reach backend server',
            data: null,
          },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch data submission stats',
        data: null,
      },
      { status: 500 }
    )
  }
}
