import { NextResponse } from 'next/server'

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') || '0'
  const limit = searchParams.get('limit') || '10'

  try {
    // Try to fetch from backend first
    const backendResponse = await fetch(
      `${BACKEND_API_URL}/blocks?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout for backend requests
        signal: AbortSignal.timeout(5000),
      }
    )

    if (backendResponse.ok) {
      const data = await backendResponse.json()
      return NextResponse.json(data)
    }

    // If backend fails, fall back to direct Subscan API call
    console.warn('Backend not available, falling back to Subscan API')

    const fallbackResponse = await fetch(
      'https://avail.api.subscan.io/api/scan/blocks',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Avail-Explorer/1.0',
          'X-API-Key': process.env.SUBSCAN_API_KEY || '',
        },
        body: JSON.stringify({
          row: parseInt(limit),
          page: parseInt(page),
        }),
      }
    )

    if (!fallbackResponse.ok) {
      throw new Error(`Subscan API error: ${fallbackResponse.status}`)
    }

    const fallbackData = await fallbackResponse.json()

    // Transform data to match our Block interface
    const blocks =
      fallbackData.data?.blocks?.map((block: any) => ({
        number: block.block_num,
        hash: block.hash,
        time: block.block_timestamp * 1000,
        extrinsics: block.extrinsics_count || 0,
        parentHash: block.parent_hash,
        stateRoot: block.state_root,
      })) || []

    // Return in same format as backend
    return NextResponse.json({
      success: true,
      data: blocks,
      timestamp: new Date().toISOString(),
    })
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
