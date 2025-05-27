import { NextResponse } from 'next/server'

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') || '0'
  const limit = searchParams.get('limit') || '10'
  const appId = searchParams.get('appId')
  const submitter = searchParams.get('submitter')

  try {
    // Fetch from backend API
    const params = new URLSearchParams({ page, limit })
    if (appId) params.append('appId', appId)
    if (submitter) params.append('submitter', submitter)

    const backendResponse = await fetch(
      `${BACKEND_API_URL}/data-submissions?${params}`,
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
      console.log('✅ Backend data submissions data received:', data.meta)
      return NextResponse.json(data)
    }

    // If backend fails, return error instead of mock data
    console.error('❌ Backend not available for data submissions')
    return NextResponse.json(
      {
        success: false,
        error:
          'Backend service unavailable - no data submissions data available',
        data: [],
        meta: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          source: 'error',
        },
      },
      { status: 503 }
    )
  } catch (error) {
    console.error('❌ Data submissions API error:', error)

    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        return NextResponse.json(
          {
            success: false,
            error: 'Request timeout - backend server may be unavailable',
            data: [],
          },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch data submissions',
        data: [],
      },
      { status: 500 }
    )
  }
}
