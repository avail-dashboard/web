import { NextResponse } from 'next/server'

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001/api'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const appId = params.id

  try {
    const backendUrl = `${BACKEND_API_URL}/data-submissions/rollup/${appId}`
    console.log('🔄 Fetching rollup data from backend URL:', backendUrl)

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    })

    console.log('📡 Backend rollup response status:', backendResponse.status)

    if (backendResponse.ok) {
      const data = await backendResponse.json()
      console.log('✅ Backend rollup data received:', data.meta)
      return NextResponse.json(data)
    } else {
      console.error(
        '❌ Backend rollup response not OK:',
        backendResponse.status,
        backendResponse.statusText
      )

      return NextResponse.json(
        {
          success: false,
          error: `Backend server error: ${backendResponse.status} ${backendResponse.statusText}`,
          data: {
            dataSubmissions: [],
            totalCount: 0,
            appId: parseInt(appId),
          },
          meta: {
            source: 'error',
            total: 0,
            app_id: appId,
          },
        },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('❌ Data submissions rollup API error:', error)

    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        console.error('❌ Rollup timeout error - backend may be slow or unreachable')
        return NextResponse.json(
          {
            success: false,
            error: 'Request timeout - backend server may be unavailable',
            data: {
              dataSubmissions: [],
              totalCount: 0,
              appId: parseInt(appId),
            },
          },
          { status: 503 }
        )
      }

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('❌ Rollup network error - backend may be unreachable')
        return NextResponse.json(
          {
            success: false,
            error: 'Network error - cannot reach backend server',
            data: {
              dataSubmissions: [],
              totalCount: 0,
              appId: parseInt(appId),
            },
          },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch rollup data submissions',
        data: {
          dataSubmissions: [],
          totalCount: 0,
          appId: parseInt(appId),
        },
      },
      { status: 500 }
    )
  }
} 