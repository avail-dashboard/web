import { useState, useEffect, useCallback } from 'react'
import { availAPI, availWS, Block, ChainData, Extrinsic, Validator, Account, SearchResult } from '../api'

// Generic hook for API requests with loading and error states
export function useAPIRequest<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: {
    enabled?: boolean
    refetchInterval?: number
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
  } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const { enabled = true, refetchInterval, onSuccess, onError } = options

  const fetchData = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const result = await apiCall()
      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [apiCall, enabled, onSuccess, onError])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...dependencies])

  // Set up interval if specified
  useEffect(() => {
    if (!refetchInterval || !enabled) return

    const interval = setInterval(fetchData, refetchInterval)
    return () => clearInterval(interval)
  }, [fetchData, refetchInterval, enabled])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

// Specific hooks for different data types
export function useBlocks(count: number = 10, options?: {
  refetchInterval?: number
  onNewBlock?: (block: Block) => void
}) {
  const { refetchInterval = 6000, onNewBlock } = options || {}

  const result = useAPIRequest(
    () => availAPI.getLatestBlocks(count),
    [count],
    { 
      refetchInterval,
      onSuccess: (blocks) => {
        if (onNewBlock && blocks.length > 0) {
          onNewBlock(blocks[0])
        }
      }
    }
  )

  return result
}

export function useChainData(options?: {
  refetchInterval?: number
}) {
  const { refetchInterval = 30000 } = options || {}

  return useAPIRequest(
    () => availAPI.getChainData(),
    [],
    { refetchInterval }
  )
}

export function useBlock(numberOrHash: string | number | null) {
  return useAPIRequest(
    () => numberOrHash ? availAPI.getBlock(numberOrHash) : Promise.resolve(null),
    [numberOrHash],
    { enabled: !!numberOrHash }
  )
}

export function useExtrinsics(blockNumber?: number, page: number = 0, limit: number = 10) {
  return useAPIRequest(
    () => availAPI.getExtrinsics(blockNumber, page, limit),
    [blockNumber, page, limit]
  )
}

export function useValidators() {
  return useAPIRequest(
    () => availAPI.getValidators(),
    [],
    { refetchInterval: 300000 } // 5 minutes
  )
}

export function useAccount(address: string | null) {
  return useAPIRequest(
    () => address ? availAPI.getAccount(address) : Promise.resolve(null),
    [address],
    { enabled: !!address }
  )
}

export function useSearch(query: string, options?: {
  enabled?: boolean
  debounceMs?: number
}) {
  const { enabled = true, debounceMs = 300 } = options || {}
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs])

  return useAPIRequest(
    () => availAPI.search(debouncedQuery),
    [debouncedQuery],
    { enabled: enabled && debouncedQuery.trim().length > 0 }
  )
}

export function useAnalytics(period: '24h' | '7d' | '30d' = '24h') {
  return useAPIRequest(
    () => availAPI.getAnalytics(period),
    [period],
    { refetchInterval: 60000 } // 1 minute
  )
}

// Hook for backend connection status
export function useBackendStatus() {
  const [isConnected, setIsConnected] = useState(true)
  const [lastChecked, setLastChecked] = useState(new Date())

  const checkStatus = useCallback(async () => {
    try {
      const status = await availAPI.refreshBackendStatus()
      setIsConnected(status)
      setLastChecked(new Date())
    } catch (error) {
      setIsConnected(false)
      setLastChecked(new Date())
    }
  }, [])

  useEffect(() => {
    // Check status on mount
    checkStatus()

    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [checkStatus])

  return {
    isConnected,
    lastChecked,
    checkStatus
  }
}

// Hook for real-time WebSocket updates
export function useWebSocket(options?: {
  onBlockUpdate?: (block: Block) => void
  onExtrinsicUpdate?: (extrinsic: Extrinsic) => void
  onChainStatsUpdate?: (stats: Partial<ChainData>) => void
  autoConnect?: boolean
}) {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    onBlockUpdate,
    onExtrinsicUpdate,
    onChainStatsUpdate,
    autoConnect = true
  } = options || {}

  useEffect(() => {
    if (!autoConnect) return

    const handleMessage = (data: any) => {
      switch (data.type) {
        case 'new_block':
          onBlockUpdate?.(data.block)
          break
        case 'new_extrinsic':
          onExtrinsicUpdate?.(data.extrinsic)
          break
        case 'chain_stats':
          onChainStatsUpdate?.(data.stats)
          break
      }
    }

    const handleError = (error: Event) => {
      setError('WebSocket connection error')
      setConnected(false)
    }

    availWS.connect(handleMessage, handleError)

    // Track connection status
    const originalOnOpen = availWS.connect
    availWS.connect = (onMessage, onError) => {
      originalOnOpen.call(availWS, onMessage, onError)
      setConnected(true)
      setError(null)
    }

    return () => {
      availWS.disconnect()
      setConnected(false)
    }
  }, [autoConnect, onBlockUpdate, onExtrinsicUpdate, onChainStatsUpdate])

  const subscribe = useCallback((topic: string) => {
    availWS.subscribe(topic)
  }, [])

  const unsubscribe = useCallback((topic: string) => {
    availWS.unsubscribe(topic)
  }, [])

  return {
    connected,
    error,
    subscribe,
    unsubscribe
  }
} 