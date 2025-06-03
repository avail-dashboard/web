import { NextRequest } from 'next/server'
import { GET as blocksHandler } from '@/app/api/blocks/route'
import { GET as blockByIdHandler } from '@/app/api/blocks/[id]/route'

// Mock environment variable
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3001'

describe('/api/blocks', () => {
  describe('GET /api/blocks', () => {
    it('should return paginated blocks with default parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/blocks')
      const response = await blocksHandler(request)

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.meta).toHaveProperty('page')
      expect(data.meta).toHaveProperty('limit')
      expect(data.meta).toHaveProperty('total')
      expect(data.meta.source).toBe('rpc')

      // Check block structure
      if (data.data.length > 0) {
        const block = data.data[0]
        expect(block).toHaveProperty('number')
        expect(block).toHaveProperty('hash')
        expect(block).toHaveProperty('parentHash')
        expect(block).toHaveProperty('timestamp')
        expect(block).toHaveProperty('extrinsics')
        expect(block).toHaveProperty('finalized')
      }
    })

    it('should handle pagination parameters correctly', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/blocks?page=2&limit=5'
      )
      const response = await blocksHandler(request)

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.meta.page).toBe(2)
      expect(data.meta.limit).toBe(5)
    })

    it('should handle invalid pagination gracefully', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/blocks?page=invalid&limit=abc'
      )
      const response = await blocksHandler(request)

      expect(response.status).toBe(200)

      const data = await response.json()
      // Should default to valid values
      expect(typeof data.meta.page).toBe('number')
      expect(typeof data.meta.limit).toBe('number')
    })

    it('should handle backend timeout', async () => {
      // Override URL to simulate timeout
      const originalUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:9999'

      const request = new NextRequest('http://localhost:3000/api/blocks')
      const response = await blocksHandler(request)

      expect(response.status).toBe(503)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('backend server')

      // Restore original URL
      process.env.NEXT_PUBLIC_API_BASE_URL = originalUrl
    })
  })

  describe('GET /api/blocks/[id]', () => {
    it('should return specific block by number', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/blocks/1000000'
      )
      const response = await blockByIdHandler(request, {
        params: { id: '1000000' },
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('number')
      expect(data.data).toHaveProperty('hash')
      expect(data.data).toHaveProperty('extrinsics')
      expect(data.meta.source).toBe('rpc')

      // Should include extrinsics array
      expect(Array.isArray(data.data.extrinsics)).toBe(true)
    })

    it('should return specific block by hash', async () => {
      const blockHash =
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      const request = new NextRequest(
        `http://localhost:3000/api/blocks/${blockHash}`
      )
      const response = await blockByIdHandler(request, {
        params: { id: blockHash },
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.hash).toBe(blockHash)
    })

    it('should handle invalid block ID', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/blocks/invalid'
      )
      const response = await blockByIdHandler(request, {
        params: { id: 'invalid' },
      })

      // Should still return 200 with mock data for testing
      expect(response.status).toBe(200)
    })

    it('should handle backend errors for specific block', async () => {
      const originalUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:9999'

      const request = new NextRequest(
        'http://localhost:3000/api/blocks/1000000'
      )
      const response = await blockByIdHandler(request, {
        params: { id: '1000000' },
      })

      expect(response.status).toBe(503)

      const data = await response.json()
      expect(data.success).toBe(false)

      process.env.NEXT_PUBLIC_API_BASE_URL = originalUrl
    })
  })
})
