import { NextResponse } from 'next/server'

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001/api'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const submissionId = params.id

  try {
    const backendUrl = `${BACKEND_API_URL}/data-submissions/${submissionId}`
    console.log('🔄 Fetching specific data submission from backend URL:', backendUrl)

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    })

    console.log('📡 Backend submission response status:', backendResponse.status)

    if (backendResponse.ok) {
      const data = await backendResponse.json()
      console.log('✅ Backend specific submission data received')
      return NextResponse.json(data)
    } else if (backendResponse.status === 404) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Data submission not found',
          },
        },
        { status: 404 }
      )
    } else {
      console.error(
        '❌ Backend submission response not OK:',
        backendResponse.status,
        backendResponse.statusText
      )

      return NextResponse.json(
        {
          success: false,
          error: `Backend server error: ${backendResponse.status} ${backendResponse.statusText}`,
        },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('❌ Specific data submission API error:', error)

    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        console.error('❌ Submission timeout error - backend may be slow or unreachable')
        return NextResponse.json(
          {
            success: false,
            error: 'Request timeout - backend server may be unavailable',
          },
          { status: 503 }
        )
      }

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('❌ Submission network error - backend may be unreachable')
        return NextResponse.json(
          {
            success: false,
            error: 'Network error - cannot reach backend server',
          },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch data submission',
      },
      { status: 500 }
    )
  }
} 