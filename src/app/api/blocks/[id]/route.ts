import { NextResponse } from 'next/server'

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const blockId = params.id

  try {
    // Try to fetch from backend first
    const backendResponse = await fetch(
      `${BACKEND_API_URL}/blocks/${blockId}`,
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

      if (data.success && data.data) {
        const rawBlock = data.data

        // Transform snake_case to camelCase
        const block = {
          number: rawBlock.number,
          hash: rawBlock.hash,
          time: rawBlock.timestamp || rawBlock.time,
          extrinsics: rawBlock.extrinsics_count || rawBlock.extrinsics,
          parentHash: rawBlock.parent_hash || rawBlock.parentHash,
          stateRoot: rawBlock.state_root || rawBlock.stateRoot,
        }

        return NextResponse.json({
          success: true,
          data: block,
          timestamp: new Date().toISOString(),
        })
      }
    }

    // If backend fails or returns no data
    return NextResponse.json(
      {
        success: false,
        error: 'Block not found',
      },
      { status: 404 }
    )
  } catch (error) {
    console.error('Block API error:', error)

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
        error: 'Failed to fetch block',
      },
      { status: 500 }
    )
  }
}
