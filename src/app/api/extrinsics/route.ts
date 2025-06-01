import { NextResponse } from 'next/server'

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  // Remove pagination parameters - get all extrinsics
  const block = searchParams.get('block')
  const signer = searchParams.get('signer')
  const method = searchParams.get('method')
  const success = searchParams.get('success')

  try {
    // Fetch from backend API without pagination
    const params = new URLSearchParams()
    if (block) {
      params.append('block', block)
    }
    if (signer) {
      params.append('signer', signer)
    }
    if (method) {
      params.append('method', method)
    }
    if (success) {
      params.append('success', success)
    }

    const backendResponse = await fetch(
      `${BACKEND_API_URL}/extrinsics${params.toString() ? `?${params}` : ''}`,
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
      console.log('✅ Backend extrinsics data received (all results)')
      return NextResponse.json(data)
    }

    // If backend fails, return error instead of mock data
    console.error('❌ Backend not available for extrinsics')
    return NextResponse.json(
      {
        success: false,
        error: 'Backend service unavailable - no extrinsics data available',
        data: [],
      },
      { status: 503 }
    )
  } catch (error) {
    console.error('❌ Extrinsics API error:', error)

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
        error: 'Failed to fetch extrinsics',
        data: [],
      },
      { status: 500 }
    )
  }
}
