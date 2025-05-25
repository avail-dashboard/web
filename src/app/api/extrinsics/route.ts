import { NextResponse } from 'next/server'

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') || '0'
  const limit = searchParams.get('limit') || '10'
  const block = searchParams.get('block')

  try {
    // Try to fetch from backend first
    const params = new URLSearchParams({ page, limit })
    if (block) {
      params.append('block', block)
    }

    const backendResponse = await fetch(`${BACKEND_API_URL}/extrinsics?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    })

    if (backendResponse.ok) {
      const data = await backendResponse.json()
      return NextResponse.json(data)
    }

    // If backend fails, return empty array for now
    // (Subscan extrinsics API would need specific implementation)
    console.warn('Backend not available, extrinsics fallback not implemented yet')
    
    return NextResponse.json({
      success: true,
      data: [],
      timestamp: new Date().toISOString(),
      message: 'Extrinsics data not available without backend'
    })

  } catch (error) {
    console.error('Extrinsics API error:', error)
    
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        return NextResponse.json({ 
          success: false,
          error: 'Request timeout - backend server may be unavailable' 
        }, { status: 503 })
      }
    }

    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch extrinsics' 
    }, { status: 500 })
  }
} 