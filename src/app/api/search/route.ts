import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is required but not set')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'Search query is required',
      },
      { status: 400 }
    )
  }

  try {
    // Try to fetch from backend first
    const backendResponse = await fetch(
      `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      }
    )

    if (backendResponse.ok) {
      const data = await backendResponse.json()
      return NextResponse.json(data)
    }

    // If backend fails, return empty results
    console.warn('Backend not available, search functionality requires backend')

    return NextResponse.json({
      success: true,
      data: [],
      timestamp: new Date().toISOString(),
      message: 'Search functionality not available without backend',
    })
  } catch (error) {
    console.error('Search API error:', error)

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
        error: 'Failed to perform search',
      },
      { status: 500 }
    )
  }
}
