import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is required but not set')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Search query parameter is required',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    )
  }

  try {
    // Try to fetch from backend first - backend might still expect 'q' parameter
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
      console.log('Backend search response:', data)
      
      // If backend returns data in old format, convert to new format
      if (Array.isArray(data)) {
        // Old format: just an array of results
        return NextResponse.json({
          success: true,
          data: {
            query: query,
            total_results: data.length,
            results: data.map(item => ({
              type: item.type || 'unknown',
              id: item.id || item.number || item.hash || '',
              data: item,
              context: item.title || item.description || `${item.type} ${item.id || item.number || item.hash}`
            }))
          },
          meta: {
            source: 'database',
            total: data.length
          },
          timestamp: new Date().toISOString()
        })
      } else if (data && data.success !== undefined) {
        // New format: structured response
        return NextResponse.json(data)
      } else {
        // Unknown format, try to extract results
        const results = data.results || data.data || []
        return NextResponse.json({
          success: true,
          data: {
            query: query,
            total_results: results.length,
            results: Array.isArray(results) ? results : []
          },
          meta: {
            source: 'database',
            total: results.length
          },
          timestamp: new Date().toISOString()
        })
      }
    }

    // If backend fails, return empty results
    console.warn('Backend not available, search functionality requires backend')

    return NextResponse.json({
      success: true,
      data: {
        query: query,
        total_results: 0,
        results: [],
      },
      meta: {
        source: 'fallback',
        total: 0,
      },
      timestamp: new Date().toISOString(),
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
