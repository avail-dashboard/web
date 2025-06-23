export const mockHealthResponse = {
  success: true,
  data: {
    status: 'healthy',
    timestamp: '2024-01-01T12:00:00Z',
    uptime: 3600,
    version: '1.0.0',
    database: {
      status: 'connected',
      latency: 5
    },
    blockchain: {
      status: 'synced',
      latestBlock: 123456,
      blockTime: 6000
    }
  }
}

export const mockApiHealthResponse = {
  success: true,
  data: {
    api: 'healthy',
    database: 'connected',
    blockchain: 'synced',
    timestamp: '2024-01-01T12:00:00Z'
  }
} 