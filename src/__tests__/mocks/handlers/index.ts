import { http, HttpResponse } from 'msw'
import { mockHealthResponse, mockApiHealthResponse } from '../data/health'
import { mockBlocksResponse, mockBlockByIdResponse } from '../data/blocks'
import {
  mockExtrinsicsResponse,
  mockExtrinsicByHashResponse,
} from '../data/extrinsics'
import { mockAccountResponse } from '../data/accounts'
import { mockSearchResponse, mockSearchMultipleResponse } from '../data/search'

// Get the base URL from environment or use default
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export const handlers = [
  // Health endpoints
  http.get(`${API_BASE_URL}/health`, () => {
    return HttpResponse.json(mockHealthResponse)
  }),

  http.get(`${API_BASE_URL}/api/health`, () => {
    return HttpResponse.json(mockApiHealthResponse)
  }),

  // Blocks endpoints
  http.get(`${API_BASE_URL}/api/blocks`, ({ request }) => {
    const url = new URL(request.url)
    const page = url.searchParams.get('page') || '1'
    const limit = url.searchParams.get('limit') || '10'

    // Return paginated response
    const response = {
      ...mockBlocksResponse,
      meta: {
        ...mockBlocksResponse.meta,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    }

    return HttpResponse.json(response)
  }),

  http.get(`${API_BASE_URL}/api/blocks/:id`, ({ params }) => {
    const { id } = params

    // Return specific block
    const response = {
      ...mockBlockByIdResponse,
      data: {
        ...mockBlockByIdResponse.data,
        number:
          typeof id === 'string' && !isNaN(Number(id))
            ? Number(id)
            : mockBlockByIdResponse.data.number,
        hash:
          typeof id === 'string' && id.startsWith('0x')
            ? id
            : mockBlockByIdResponse.data.hash,
      },
    }

    return HttpResponse.json(response)
  }),

  // Extrinsics endpoints
  http.get(`${API_BASE_URL}/api/extrinsics`, ({ request }) => {
    const url = new URL(request.url)
    const page = url.searchParams.get('page') || '1'
    const limit = url.searchParams.get('limit') || '10'
    const block = url.searchParams.get('block')

    const baseResponse = { ...mockExtrinsicsResponse }

    // Filter by block if specified
    if (block) {
      const filteredData = baseResponse.data.filter(
        ext => ext.blockNumber === parseInt(block)
      )
      const response = {
        ...baseResponse,
        data: filteredData,
        meta: {
          ...baseResponse.meta,
          total: filteredData.length,
          page: parseInt(page),
          limit: parseInt(limit),
        },
      }
      return HttpResponse.json(response)
    }

    // Apply pagination
    const response = {
      ...baseResponse,
      meta: {
        ...baseResponse.meta,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    }

    return HttpResponse.json(response)
  }),

  http.get(`${API_BASE_URL}/api/extrinsics/:hash`, ({ params }) => {
    const { hash } = params

    const response = {
      ...mockExtrinsicByHashResponse,
      data: {
        ...mockExtrinsicByHashResponse.data,
        hash: hash as string,
      },
    }

    return HttpResponse.json(response)
  }),

  // Search endpoint
  http.get(`${API_BASE_URL}/api/search`, ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')

    if (!query) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query parameter required',
          },
        },
        { status: 400 }
      )
    }

    // Simple search logic for testing
    if (query === '1000000') {
      return HttpResponse.json(mockSearchResponse)
    } else if (query === 'multiple') {
      return HttpResponse.json(mockSearchMultipleResponse)
    } else {
      return HttpResponse.json({
        success: true,
        data: [],
        meta: { total: 0, source: 'database' as const },
      })
    }
  }),

  // Accounts endpoint
  http.get(`${API_BASE_URL}/api/accounts/:address`, ({ params }) => {
    const { address } = params

    const response = {
      ...mockAccountResponse,
      data: {
        ...mockAccountResponse.data,
        address: address as string,
      },
    }

    return HttpResponse.json(response)
  }),

  // Error handlers for testing error scenarios
  http.get(`${API_BASE_URL}/api/blocks/error`, () => {
    return HttpResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Test error' },
      },
      { status: 500 }
    )
  }),

  http.get(`${API_BASE_URL}/api/blocks/timeout`, () => {
    return HttpResponse.json(
      {
        success: false,
        error: 'Request timeout - backend server may be unavailable',
      },
      { status: 503 }
    )
  }),

  http.get(`${API_BASE_URL}/api/blocks/notfound`, () => {
    return HttpResponse.json(
      {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Block not found' },
      },
      { status: 404 }
    )
  }),
]
