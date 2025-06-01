import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is required but not set')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') || '0'
  const limit = searchParams.get('limit') || '10'

  try {
    // Fetch from backend API only
    const backendResponse = await fetch(
      `${API_BASE_URL}/blocks?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Increased timeout since we're not using fallback
        signal: AbortSignal.timeout(10000),
      }
    )

    if (backendResponse.ok) {
      const data = await backendResponse.json()
      return NextResponse.json(data)
    }

    // If backend fails, return error instead of fallback
    throw new Error(`Backend API error: ${backendResponse.status}`)
  } catch (error) {
    console.error('Blocks API error:', error)

    // Determine error type for better error messages
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
      if (error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Backend server is not running',
          },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blocks',
      },
      { status: 500 }
    )
  }
}
