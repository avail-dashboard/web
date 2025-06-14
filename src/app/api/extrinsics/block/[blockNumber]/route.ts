import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is required but not set')
}

export async function GET(
  request: Request,
  { params }: { params: { blockNumber: string } }
) {
  const blockNumber = params.blockNumber

  try {
    const backendResponse = await fetch(
      `${API_BASE_URL}/extrinsics/block/${blockNumber}`,
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
      return NextResponse.json(data)
    }

    throw new Error(`Backend API error: ${backendResponse.status}`)
  } catch (error) {
    console.error('Extrinsics by block API error:', error)

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
        error: 'Failed to fetch block extrinsics',
      },
      { status: 500 }
    )
  }
} 