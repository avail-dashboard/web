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
      const backendData = await backendResponse.json()
      console.log('✅ Backend response received:', backendData)

      // Check if backend returned the expected structure
      if (backendData.success && backendData.data) {
        // Backend data is already in the correct format, just pass it through
        return NextResponse.json(backendData)
      }
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

    // Initialize with default values matching ChainData interface
    let chainData: any = {
      finalizedBlocks: 0,
      signedExtrinsics: 0,
      stakedAmount: '0',
      bondedAmount: '0',
      holders: 0,
      totalAccounts: 0,
      transfers: 0,
      inflationRate: 0,
      tokenPrice: 0,
      priceChange: 0,
      totalIssuance: '0',
      circulating: { amount: '0', percentage: 0 },
      staking: { amount: '0', percentage: 0 },
      treasury: { amount: '0', percentage: 0 },
      others: { amount: '0', percentage: 0 },
    }

    // Process stats response
    if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
      const stats = await statsResponse.value.json()
      console.log('📊 Subscan stats received:', stats.data)

      if (stats.data) {
        chainData = {
          ...chainData,
          finalizedBlocks: stats.data.blockNum || 0,
          signedExtrinsics: stats.data.extrinsicsCount || 0,
          totalAccounts: stats.data.accountsCount || 0,
          transfers: stats.data.transfersCount || 0,
        }
      }
    }

    // Process price response
    if (priceResponse.status === 'fulfilled' && priceResponse.value.ok) {
      const priceData = await priceResponse.value.json()
      console.log('💰 Price data received:', priceData)

      const avail = priceData.avail
      if (avail) {
        chainData = {
          ...chainData,
          tokenPrice: avail.usd || 0,
          priceChange: avail.usd_24h_change || 0,
        }
      }
    }

    console.log('📊 Final frontend API chain data:', chainData)

    return NextResponse.json({
      success: true,
      data: chainData,
      meta: {
        source: 'subscan',
      },
    })
  } catch (error) {
    console.error('❌ Chain stats API error:', error)

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
