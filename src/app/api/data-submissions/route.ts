import { NextResponse } from 'next/server'

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001/api'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') || '0'
  const limit = searchParams.get('limit') || '10'
  const appId = searchParams.get('appId')
  const submitter = searchParams.get('submitter')

  try {
    // Convert 0-based pagination to 1-based for backend
    const backendPage = (parseInt(page) + 1).toString()

    // Fetch from backend API
    const params = new URLSearchParams({ page: backendPage, limit })
    if (appId) params.append('appId', appId)
    if (submitter) params.append('submitter', submitter)

    const backendUrl = `${BACKEND_API_URL}/data-submissions?${params}`
    console.log('🔄 Fetching from backend URL:', backendUrl)

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // Reduced timeout to 5 seconds
    })

    console.log('📡 Backend response status:', backendResponse.status)

    if (backendResponse.ok) {
      const data = await backendResponse.json()
      console.log('✅ Backend data submissions data received:', data.meta)
      return NextResponse.json(data)
    } else {
      console.error(
        '❌ Backend response not OK:',
        backendResponse.status,
        backendResponse.statusText
      )

      // If backend fails, return error instead of mock data
      return NextResponse.json(
        {
          success: false,
          error: `Backend server error: ${backendResponse.status} ${backendResponse.statusText}`,
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
    }
  } catch (error) {
    console.error('❌ Data submissions API error:', error)

    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        console.error('❌ Timeout error - backend may be slow or unreachable')
        return NextResponse.json(
          {
            success: false,
            error: 'Request timeout - backend server may be unavailable',
            data: [],
          },
          { status: 503 }
        )
      }

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('❌ Network error - backend may be unreachable')
        return NextResponse.json(
          {
            success: false,
            error: 'Network error - cannot reach backend server',
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
