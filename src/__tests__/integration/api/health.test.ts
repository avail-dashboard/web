import { GET as healthHandler } from '@/app/api/health/route'

// Mock environment variable
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3001'

describe('/api/health', () => {
  it('should return health status with backend check', async () => {
    const response = await healthHandler()

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('status')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('frontend')
    expect(data).toHaveProperty('backend')
    expect(data).toHaveProperty('services')

    expect(data.frontend.status).toBe('healthy')
    expect(data.backend.available).toBe(true)
  })

  it('should handle backend unavailable gracefully', async () => {
    // Temporarily override the API URL to simulate backend failure
    const originalUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:9999'

    const response = await healthHandler()

    expect(response.status).toBe(503)

    const data = await response.json()
    expect(data.status).toBe('degraded')
    expect(data.backend.available).toBe(false)
    expect(data.backend.status).toBe('unreachable')

    // Restore original URL
    process.env.NEXT_PUBLIC_API_BASE_URL = originalUrl
  })

  it('should include proper timestamp format', async () => {
    const response = await healthHandler()

    const data = await response.json()
    expect(data.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    )
    expect(data.frontend.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    )
  })
})
