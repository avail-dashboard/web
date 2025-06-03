import { NextRequest } from 'next/server'
import { GET as extrinsicsHandler } from '@/app/api/extrinsics/route'
import type { ApiResponse, Extrinsic } from '../../types/api'

// Mock environment variable
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3001'

describe('/api/extrinsics', () => {
  describe('GET /api/extrinsics', () => {
    it('should return paginated extrinsics with default parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/extrinsics')
      const response = await extrinsicsHandler(request)

      expect(response.status).toBe(200)

      const data: ApiResponse<Extrinsic[]> = await response.json()
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.meta).toHaveProperty('page')
      expect(data.meta).toHaveProperty('limit')
      expect(data.meta).toHaveProperty('total')
      expect(data.meta.source).toBe('rpc')

      // Check extrinsic structure
      if (data.data.length > 0) {
        const extrinsic = data.data[0]
        expect(extrinsic).toHaveProperty('hash')
        expect(extrinsic).toHaveProperty('blockNumber')
        expect(extrinsic).toHaveProperty('extrinsicIndex')
        expect(extrinsic).toHaveProperty('module')
        expect(extrinsic).toHaveProperty('call')
        expect(extrinsic).toHaveProperty('success')
        expect(extrinsic).toHaveProperty('timestamp')
        expect(extrinsic).toHaveProperty('signer')
        expect(extrinsic).toHaveProperty('fee')
        expect(extrinsic).toHaveProperty('isSigned')
        expect(extrinsic).toHaveProperty('isUserTransaction')
      }
    })

    it('should handle pagination parameters correctly', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/extrinsics?page=2&limit=5'
      )
      const response = await extrinsicsHandler(request)

      expect(response.status).toBe(200)

      const data: ApiResponse<Extrinsic[]> = await response.json()
      expect(data.meta.page).toBe(2)
      expect(data.meta.limit).toBe(5)
    })

    it('should filter by block number when provided', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/extrinsics?block=1000000'
      )
      const response = await extrinsicsHandler(request)

      expect(response.status).toBe(200)

      const data: ApiResponse<Extrinsic[]> = await response.json()
      expect(data.success).toBe(true)

      // All returned extrinsics should be from the specified block
      data.data.forEach((extrinsic: Extrinsic) => {
        expect(extrinsic.blockNumber).toBe(1000000)
      })
    })

    it('should handle combined pagination and block filter', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/extrinsics?block=1000000&page=1&limit=2'
      )
      const response = await extrinsicsHandler(request)

      expect(response.status).toBe(200)

      const data: ApiResponse<Extrinsic[]> = await response.json()
      expect(data.meta.page).toBe(1)
      expect(data.meta.limit).toBe(2)

      data.data.forEach((extrinsic: Extrinsic) => {
        expect(extrinsic.blockNumber).toBe(1000000)
      })
    })

    it('should return empty array for non-existent block', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/extrinsics?block=999999999'
      )
      const response = await extrinsicsHandler(request)

      expect(response.status).toBe(200)

      const data: ApiResponse<Extrinsic[]> = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(0)
      expect(data.meta.total).toBe(0)
    })

    it('should handle invalid pagination gracefully', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/extrinsics?page=invalid&limit=abc'
      )
      const response = await extrinsicsHandler(request)

      expect(response.status).toBe(200)

      const data: ApiResponse<Extrinsic[]> = await response.json()
      expect(typeof data.meta.page).toBe('number')
      expect(typeof data.meta.limit).toBe('number')
    })

    it('should handle backend timeout', async () => {
      const originalUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:9999'

      const request = new NextRequest('http://localhost:3000/api/extrinsics')
      const response = await extrinsicsHandler(request)

      expect(response.status).toBe(503)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('backend server')

      process.env.NEXT_PUBLIC_API_BASE_URL = originalUrl
    })

    it('should include data submission extrinsics', async () => {
      const request = new NextRequest('http://localhost:3000/api/extrinsics')
      const response = await extrinsicsHandler(request)

      expect(response.status).toBe(200)

      const data: ApiResponse<Extrinsic[]> = await response.json()

      // Check if there are any data submission extrinsics
      const dataSubmissions = data.data.filter(
        (ext: Extrinsic) =>
          ext.module === 'DataAvailability' && ext.call === 'submit_data'
      )

      expect(dataSubmissions.length).toBeGreaterThan(0)

      if (dataSubmissions.length > 0) {
        const dataSubmission = dataSubmissions[0]
        expect(dataSubmission.args).toHaveProperty('data')
        expect(dataSubmission.args).toHaveProperty('appId')
      }
    })
  })
})
