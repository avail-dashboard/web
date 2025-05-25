import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Mock API responses
export const handlers = [
  // Mock health check endpoint
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: Date.now(),
      services: {
        polkadot: 'connected',
        database: 'connected',
      },
    })
  }),

  // Mock chain info endpoint
  http.get('/api/chain', () => {
    return HttpResponse.json({
      name: 'Avail Testnet',
      version: '1.0.0',
      properties: {
        ss58Format: 42,
        tokenDecimals: 18,
        tokenSymbol: 'AVAIL',
      },
    })
  }),

  // Mock blocks endpoint
  http.get('/api/blocks', () => {
    return HttpResponse.json({
      blocks: [
        {
          number: 1000,
          hash: '0x1234567890abcdef',
          timestamp: Date.now() - 60000,
          extrinsicsCount: 5,
        },
        {
          number: 999,
          hash: '0xabcdef1234567890',
          timestamp: Date.now() - 120000,
          extrinsicsCount: 3,
        },
      ],
      total: 1000,
    })
  }),

  // Mock search endpoint
  http.get('/api/search', ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')

    if (query === '1000') {
      return HttpResponse.json({
        type: 'block',
        result: {
          number: 1000,
          hash: '0x1234567890abcdef',
        },
      })
    }

    return HttpResponse.json({
      type: 'not_found',
      result: null,
    })
  }),
]

// Setup server
export const server = setupServer(...handlers)
