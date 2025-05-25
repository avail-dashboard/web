import { NextResponse } from 'next/server'

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'

export async function GET(request: Request) {
  try {
    // Try to fetch from backend first
    const backendResponse = await fetch(`${BACKEND_API_URL}/chain/stats`, {
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

    // If backend fails, fall back to Subscan API
    console.warn(
      'Backend not available, falling back to Subscan API for chain stats'
    )

    const [statsResponse, priceResponse] = await Promise.allSettled([
      fetch('https://avail.api.subscan.io/api/scan/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.SUBSCAN_API_KEY || '',
        },
        body: JSON.stringify({}),
      }),
      fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=avail&vs_currencies=usd&include_24hr_change=true'
      ),
    ])

    let chainData: any = {
      finalizedBlocks: 0,
      signedExtrinsics: 0,
      totalAccounts: 0,
      transfers: 0,
      tokenPrice: 0,
      priceChange: 0,
    }

    // Process stats response
    if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
      const stats = await statsResponse.value.json()
      chainData = {
        ...chainData,
        finalizedBlocks: stats.data?.blockNum || 0,
        signedExtrinsics: stats.data?.extrinsicsCount || 0,
        totalAccounts: stats.data?.accountsCount || 0,
        transfers: stats.data?.transfersCount || 0,
      }
    }

    // Process price response
    if (priceResponse.status === 'fulfilled' && priceResponse.value.ok) {
      const priceData = await priceResponse.value.json()
      const avail = priceData.avail
      chainData = {
        ...chainData,
        tokenPrice: avail?.usd || 0,
        priceChange: avail?.usd_24h_change || 0,
      }
    }

    return NextResponse.json({
      success: true,
      data: chainData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Chain stats API error:', error)

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
        error: 'Failed to fetch chain statistics',
      },
      { status: 500 }
    )
  }
}
