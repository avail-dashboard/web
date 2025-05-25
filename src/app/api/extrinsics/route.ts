import { NextResponse } from 'next/server'

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'

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

    const backendResponse = await fetch(
      `${BACKEND_API_URL}/extrinsics?${params}`,
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

    // If backend fails, return mock data for development
    console.warn('Backend not available, using mock extrinsics data')

    const mockExtrinsics = Array.from({ length: parseInt(limit) }, (_, i) => ({
      hash: `0x${Math.random().toString(16).substring(2).padStart(64, '0')}`,
      blockNumber: block
        ? parseInt(block)
        : 999999 - Math.floor(Math.random() * 1000),
      extrinsicIndex: i,
      module: ['system', 'balances', 'staking', 'utility'][
        Math.floor(Math.random() * 4)
      ],
      call: ['transfer', 'transferKeepAlive', 'bond', 'batch'][
        Math.floor(Math.random() * 4)
      ],
      success: Math.random() > 0.1,
      timestamp: Date.now() - i * 6000, // 6 seconds between extrinsics
      signer: `5${Math.random().toString(36).substring(2, 48)}`,
      fee: Math.floor(Math.random() * 1000000000000), // Random fee
    }))

    return NextResponse.json({
      success: true,
      data: mockExtrinsics,
      timestamp: new Date().toISOString(),
      message: 'Using mock extrinsics data (backend not available)',
    })
  } catch (error) {
    console.error('Extrinsics API error:', error)

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
        error: 'Failed to fetch extrinsics',
      },
      { status: 500 }
    )
  }
}
