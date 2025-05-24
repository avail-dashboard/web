import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') || '0'
  const limit = searchParams.get('limit') || '10'

  try {
    const response = await fetch('https://avail.api.subscan.io/api/scan/blocks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Avail-Explorer/1.0'
      },
      body: JSON.stringify({
        row: parseInt(limit),
        page: parseInt(page)
      })
    })

    if (!response.ok) {
      throw new Error(`Subscan API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform data to match our Block interface
    const blocks = data.data?.blocks?.map((block: any) => ({
      number: block.block_num,
      hash: block.hash,
      time: block.block_timestamp * 1000,
      extrinsics: block.extrinsics_count || 0,
      parentHash: block.parent_hash,
      stateRoot: block.state_root
    })) || []

    return NextResponse.json({ blocks })
  } catch (error) {
    console.error('Blocks API error:', error)
    return NextResponse.json({ error: 'Failed to fetch blocks' }, { status: 500 })
  }
} 