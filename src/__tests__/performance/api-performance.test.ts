import { GET as blocksHandler } from '@/app/api/blocks/route'
import { GET as extrinsicsHandler } from '@/app/api/extrinsics/route'
import { GET as healthHandler } from '@/app/api/health/route'
import {
  measureExecutionTime,
  expectPerformance,
  createApiRequest,
} from '../utils/test-helpers'

// Mock environment variable
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3001'

describe('API Performance Tests', () => {
  // Performance thresholds (in milliseconds)
  const PERFORMANCE_THRESHOLDS = {
    health: 100, // Health check should be very fast
    blocks: 500, // Block list should be reasonably fast
    blockDetail: 300, // Single block should be fast
    extrinsics: 800, // Extrinsics list can be slower due to complexity
    search: 400, // Search should be responsive
  }

  describe('Health Endpoint Performance', () => {
    it('should respond within performance threshold', async () => {
      const { duration } = await measureExecutionTime(async () => {
        return await healthHandler()
      })

      expectPerformance(duration, PERFORMANCE_THRESHOLDS.health)

      // Log performance for monitoring
      console.log(`Health endpoint: ${duration.toFixed(2)}ms`)
    })
  })

  describe('Blocks Endpoint Performance', () => {
    it('should handle blocks list request within threshold', async () => {
      const request = createApiRequest('/api/blocks')

      const { duration } = await measureExecutionTime(async () => {
        return await blocksHandler(request)
      })

      expectPerformance(duration, PERFORMANCE_THRESHOLDS.blocks)
      console.log(`Blocks list: ${duration.toFixed(2)}ms`)
    })

    it('should handle paginated requests efficiently', async () => {
      const request = createApiRequest('/api/blocks', {
        page: '5',
        limit: '50',
      })

      const { duration } = await measureExecutionTime(async () => {
        return await blocksHandler(request)
      })

      expectPerformance(duration, PERFORMANCE_THRESHOLDS.blocks)
      console.log(`Blocks pagination: ${duration.toFixed(2)}ms`)
    })
  })

  describe('Extrinsics Endpoint Performance', () => {
    it('should handle extrinsics list within threshold', async () => {
      const request = createApiRequest('/api/extrinsics')

      const { duration } = await measureExecutionTime(async () => {
        return await extrinsicsHandler(request)
      })

      expectPerformance(duration, PERFORMANCE_THRESHOLDS.extrinsics)
      console.log(`Extrinsics list: ${duration.toFixed(2)}ms`)
    })

    it('should handle filtered requests efficiently', async () => {
      const request = createApiRequest('/api/extrinsics', { block: '1000000' })

      const { duration } = await measureExecutionTime(async () => {
        return await extrinsicsHandler(request)
      })

      expectPerformance(duration, PERFORMANCE_THRESHOLDS.extrinsics)
      console.log(`Extrinsics filter: ${duration.toFixed(2)}ms`)
    })
  })

  describe('Concurrent Request Performance', () => {
    it('should handle multiple concurrent requests', async () => {
      const concurrentRequests = 10
      const requests = Array.from({ length: concurrentRequests }, () =>
        createApiRequest('/api/blocks')
      )

      const { duration } = await measureExecutionTime(async () => {
        const promises = requests.map(request => blocksHandler(request))
        return await Promise.all(promises)
      })

      // Concurrent requests should not take much longer than single request
      const maxConcurrentTime = PERFORMANCE_THRESHOLDS.blocks * 2
      expectPerformance(duration, maxConcurrentTime)

      console.log(
        `${concurrentRequests} concurrent requests: ${duration.toFixed(2)}ms`
      )
    })
  })

  describe('Memory Usage Monitoring', () => {
    it('should not cause memory leaks during repeated requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed

      // Make 100 requests to check for memory leaks
      for (let i = 0; i < 100; i++) {
        const request = createApiRequest('/api/blocks')
        await blocksHandler(request)
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)

      console.log(
        `Memory increase after 100 requests: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`
      )
    })
  })

  describe('Error Handling Performance', () => {
    it('should handle errors quickly', async () => {
      // Test with invalid backend URL to trigger error
      const originalUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:9999'

      const request = createApiRequest('/api/blocks')

      const { duration } = await measureExecutionTime(async () => {
        return await blocksHandler(request)
      })

      // Error responses should be fast
      expectPerformance(duration, 1000)

      // Restore original URL
      process.env.NEXT_PUBLIC_API_BASE_URL = originalUrl

      console.log(`Error handling: ${duration.toFixed(2)}ms`)
    })
  })
})
