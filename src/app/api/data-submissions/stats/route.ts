import { NextResponse } from 'next/server'

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'

export async function GET() {
  try {
    const backendResponse = await fetch(
      `${BACKEND_API_URL}/data-submissions/stats`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      }
    )

    if (backendResponse.ok) {
      const data = await backendResponse.json()
      console.log('✅ Backend data submission stats received:', data.data)
      return NextResponse.json(data)
    }

    // If backend fails, return error instead of mock data
    console.error('❌ Backend not available for data submission stats')
    return NextResponse.json(
      {
        success: false,
        error:
          'Backend service unavailable - no data submission stats available',
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
  } catch (error) {
    console.error('❌ Data submission stats API error:', error)

    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        return NextResponse.json(
          {
            success: false,
            error: 'Request timeout - backend server may be unavailable',
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
