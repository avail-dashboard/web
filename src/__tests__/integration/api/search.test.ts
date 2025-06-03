import { NextRequest } from 'next/server'
import { GET as searchHandler } from '@/app/api/search/route'
import type { ApiResponse, SearchResult } from '../../types/api'

// Mock environment variable
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3001'

describe('/api/search', () => {
  it('should return search results for valid query', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/search?q=1000000'
    )
    const response = await searchHandler(request)

    expect(response.status).toBe(200)

    const data: ApiResponse<SearchResult[]> = await response.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
    expect(data.meta).toHaveProperty('total')
    expect(data.meta.source).toBe('database')

    if (data.data.length > 0) {
      const result = data.data[0]
      expect(result).toHaveProperty('type')
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('title')
      expect(result).toHaveProperty('description')
      expect(result).toHaveProperty('url')
      expect(['block', 'extrinsic', 'account']).toContain(result.type)
    }
  })

  it('should return multiple results for broad search', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/search?q=multiple'
    )
    const response = await searchHandler(request)

    expect(response.status).toBe(200)

    const data: ApiResponse<SearchResult[]> = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.length).toBeGreaterThan(1)
    expect(data.meta.total).toBeGreaterThan(1)

    // Should include different types of results
    const types = data.data.map(result => result.type)
    expect(types).toContain('block')
    expect(types).toContain('extrinsic')
    expect(types).toContain('account')
  })

  it('should return empty results for non-existent query', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/search?q=nonexistent'
    )
    const response = await searchHandler(request)

    expect(response.status).toBe(200)

    const data: ApiResponse<SearchResult[]> = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(0)
    expect(data.meta.total).toBe(0)
  })

  it('should return 400 for missing query parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/search')
    const response = await searchHandler(request)

    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toHaveProperty('code', 'VALIDATION_ERROR')
    expect(data.error).toHaveProperty('message')
  })

  it('should handle empty query parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/search?q=')
    const response = await searchHandler(request)

    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })

  it('should handle special characters in query', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/search?q=0x1234567890abcdef'
    )
    const response = await searchHandler(request)

    expect(response.status).toBe(200)

    const data: ApiResponse<SearchResult[]> = await response.json()
    expect(data.success).toBe(true)
    // Should handle hex strings (block hashes, extrinsic hashes)
  })

  it('should handle numeric queries (block numbers)', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/search?q=1000000'
    )
    const response = await searchHandler(request)

    expect(response.status).toBe(200)

    const data: ApiResponse<SearchResult[]> = await response.json()
    expect(data.success).toBe(true)

    if (data.data.length > 0) {
      const blockResult = data.data.find(result => result.type === 'block')
      expect(blockResult).toBeDefined()
      expect(blockResult?.id).toBe('1000000')
    }
  })

  it('should handle backend timeout gracefully', async () => {
    const originalUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:9999'

    const request = new NextRequest('http://localhost:3000/api/search?q=test')
    const response = await searchHandler(request)

    expect(response.status).toBe(503)

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('backend server')

    process.env.NEXT_PUBLIC_API_BASE_URL = originalUrl
  })

  it('should validate URL structure in results', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/search?q=1000000'
    )
    const response = await searchHandler(request)

    expect(response.status).toBe(200)

    const data: ApiResponse<SearchResult[]> = await response.json()

    data.data.forEach(result => {
      expect(result.url).toMatch(/^\//) // Should start with /

      switch (result.type) {
        case 'block':
          expect(result.url).toMatch(/^\/blocks\//)
          break
        case 'extrinsic':
          expect(result.url).toMatch(/^\/extrinsics\//)
          break
        case 'account':
          expect(result.url).toMatch(/^\/accounts\//)
          break
      }
    })
  })
})
