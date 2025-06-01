'use client'

import { useEffect } from 'react'
import {
  useBlocks,
  useChainData,
  useBackendStatus,
  useWebSocket,
} from '@/lib/hooks/useAvailAPI'
import { BackendStatus, StatusBadge } from './BackendStatus'

export function ExampleAPIUsage() {
  // Using the new API hooks
  const {
    data: blocks,
    loading: blocksLoading,
    error: blocksError,
    refetch,
  } = useBlocks(5, {
    refetchInterval: 6000, // Refresh every 6 seconds
    onNewBlock: block => {
      console.log('New block received:', block.number)
    },
  })

  const { data: chainData, loading: chainLoading } = useChainData({
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const { isConnected } = useBackendStatus()

  // WebSocket for real-time updates
  const { connected: wsConnected, subscribe, unsubscribe } = useWebSocket()

  // Subscribe to real-time updates when WebSocket connects
  useEffect(() => {
    if (wsConnected) {
      subscribe('blocks')
      subscribe('chain')
      console.log('✅ Subscribed to real-time updates')
    }

    return () => {
      if (wsConnected) {
        unsubscribe('blocks')
        unsubscribe('chain')
      }
    }
  }, [wsConnected, subscribe, unsubscribe])

  return (
    <div className="p-6 space-y-6">
      {/* Status Indicators */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">API Integration Example</h1>
        <div className="flex items-center space-x-4">
          <StatusBadge />
          <div className="text-sm">WebSocket: {wsConnected ? '🟢' : '🔴'}</div>
        </div>
      </div>

      {/* Backend Status */}
      <BackendStatus showDetails={true} />

      {/* Connection Status Warning */}
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-400 mr-3" />
            <div>
              <h3 className="text-yellow-800 font-medium">Backend Offline</h3>
              <p className="text-yellow-700 text-sm">
                Using fallback APIs. Some features may be limited.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chain Data */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4">Chain Statistics</h2>
        {chainLoading ? (
          <div className="text-gray-500">Loading chain data...</div>
        ) : chainData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Finalized Blocks</div>
              <div className="text-xl font-semibold">
                {chainData.finalizedBlocks.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Accounts</div>
              <div className="text-xl font-semibold">
                {chainData.totalAccounts.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Token Price</div>
              <div className="text-xl font-semibold">
                ${chainData.tokenPrice?.toFixed(4) || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">24h Change</div>
              <div
                className={`text-xl font-semibold ${(chainData.priceChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {(chainData.priceChange || 0) >= 0 ? '+' : ''}
                {(chainData.priceChange || 0).toFixed(2)}%
              </div>
            </div>
          </div>
        ) : (
          <div className="text-red-500">Failed to load chain data</div>
        )}
      </div>

      {/* Latest Blocks */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Latest Blocks</h2>
          <button
            onClick={refetch}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {blocksLoading ? (
          <div className="text-gray-500">Loading blocks...</div>
        ) : blocksError ? (
          <div className="text-red-500">Error: {blocksError.message}</div>
        ) : blocks && blocks.length > 0 ? (
          <div className="space-y-2">
            {blocks.map(block => (
              <div
                key={block.hash}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div>
                  <div className="font-medium">Block #{block.number}</div>
                  <div className="text-sm text-gray-500">
                    {block.hash
                      ? `${block.hash.slice(0, 20)}...`
                      : 'Hash not available'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">
                    {block.extrinsics_count} extrinsics
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(block.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No blocks found</div>
        )}
      </div>

      {/* API Usage Examples */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">API Usage Examples</h3>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Frontend-Backend Integration:</strong> ✅ Active
          </div>
          <div>
            <strong>Automatic Fallback:</strong> ✅ Configured
          </div>
          <div>
            <strong>Real-time Updates:</strong>{' '}
            {wsConnected ? '✅ Connected' : '❌ Disconnected'}
          </div>
          <div>
            <strong>Error Handling:</strong> ✅ Implemented
          </div>
          <div>
            <strong>Loading States:</strong> ✅ Managed
          </div>
          <div>
            <strong>Auto-refresh:</strong> ✅ Configured
          </div>
        </div>
      </div>
    </div>
  )
}

// Example of a simple block component using the new hooks
export function SimpleBlockDisplay() {
  const { data: block, loading, error } = useBlocks(1)

  if (loading) return <div>Loading block...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!block || block.length === 0) return <div>No block data</div>

  const latestBlock = block[0]

  return (
    <div className="bg-white border rounded p-4">
      <h3 className="font-semibold">Latest Block</h3>
      <div className="mt-2">
        <div>Number: {latestBlock.number}</div>
        <div>
          Hash:{' '}
          {latestBlock.hash
            ? `${latestBlock.hash.slice(0, 20)}...`
            : 'Hash not available'}
        </div>
        <div>Extrinsics: {latestBlock.extrinsics_count}</div>
        <div>Time: {new Date(latestBlock.timestamp).toLocaleString()}</div>
      </div>
    </div>
  )
}
