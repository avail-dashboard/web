export const mockHealthResponse = {
  status: 'healthy',
  timestamp: '2024-01-01T00:00:00.000Z',
  uptime: 3600,
}

export const mockApiHealthResponse = {
  success: true,
  data: {
    status: 'healthy',
    timestamp: '2024-01-01T00:00:00.000Z',
    chain: 'Avail',
    blockHeight: 1000000,
    peers: 25,
    isSyncing: false,
  },
  meta: {
    source: 'rpc' as const,
  },
}
