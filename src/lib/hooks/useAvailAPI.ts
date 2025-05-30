import { useState, useEffect, useCallback } from 'react'
import { availAPI, Block, ChainData } from '../api'
import { availWS, SubscriptionOptions } from '@/lib/websocket'

// Generic hook for API requests with loading and error states
export function useAPIRequest<T>(
  apiCall: () => Promise<T>,
  dependencies: unknown[] = [],
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

  // Memoize the API call to prevent infinite loops
  const memoizedApiCall = useCallback(apiCall, dependencies)

  const fetchData = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const result = await memoizedApiCall()
      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [memoizedApiCall, enabled, onSuccess, onError])

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchData()
  }, [fetchData])

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
    refetch: fetchData,
  }
}

// Specific hooks for different data types
export function useBlocks(
  count: number = 10,
  options?: {
    refetchInterval?: number
    onNewBlock?: (block: Block) => void
  }
) {
  const { refetchInterval = 15000, onNewBlock } = options || {} // Increased from 6s to 15s

  // Memoize the API call function
  const apiCall = useCallback(() => availAPI.getLatestBlocks(count), [count])

  // Memoize the onSuccess callback
  const onSuccess = useCallback(
    (blocks: Block[]) => {
      if (onNewBlock && blocks.length > 0) {
        onNewBlock(blocks[0])
      }
    },
    [onNewBlock]
  )

  const result = useAPIRequest(
    apiCall,
    [], // Empty dependency array since apiCall is already memoized
    {
      refetchInterval,
      onSuccess,
    }
  )

  return result
}

export function useChainData(options?: { refetchInterval?: number }): {
  data: ChainData | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
} {
  const { refetchInterval = 60000 } = options || {} // Increased from 30s to 60s

  // Memoize the API call function
  const apiCall = useCallback(() => availAPI.getChainData(), [])

  return useAPIRequest(
    apiCall,
    [], // Empty dependency array since apiCall is already memoized
    { refetchInterval }
  )
}

export function useBlock(numberOrHash: string | number | null) {
  // Memoize the API call function
  const apiCall = useCallback(
    () =>
      numberOrHash ? availAPI.getBlock(numberOrHash) : Promise.resolve(null),
    [numberOrHash]
  )

  return useAPIRequest(
    apiCall,
    [], // Empty dependency array since apiCall is already memoized
    { enabled: !!numberOrHash }
  )
}

export function useExtrinsics(
  blockNumber?: number,
  page: number = 0,
  limit: number = 10
) {
  // Memoize the API call function
  const apiCall = useCallback(
    () => availAPI.getExtrinsics(blockNumber, page, limit),
    [blockNumber, page, limit]
  )

  return useAPIRequest(
    apiCall,
    [] // Empty dependency array since apiCall is already memoized
  )
}

export function useValidators() {
  // Memoize the API call function
  const apiCall = useCallback(() => availAPI.getValidators(), [])

  return useAPIRequest(
    apiCall,
    [], // Empty dependency array since apiCall is already memoized
    { refetchInterval: 300000 } // 5 minutes
  )
}

export function useAccount(address: string | null) {
  // Memoize the API call function
  const apiCall = useCallback(
    () => (address ? availAPI.getAccount(address) : Promise.resolve(null)),
    [address]
  )

  return useAPIRequest(
    apiCall,
    [], // Empty dependency array since apiCall is already memoized
    { enabled: !!address }
  )
}

export function useSearch(
  query: string,
  options?: {
    enabled?: boolean
    debounceMs?: number
  }
) {
  const { enabled = true, debounceMs = 300 } = options || {}
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs])

  // Memoize the API call function
  const apiCall = useCallback(
    () => availAPI.search(debouncedQuery),
    [debouncedQuery]
  )

  return useAPIRequest(
    apiCall,
    [], // Empty dependency array since apiCall is already memoized
    { enabled: enabled && debouncedQuery.trim().length > 0 }
  )
}

export function useAnalytics() {
  // Memoize the API call function
  const apiCall = useCallback(() => availAPI.getAnalytics(), [])

  return useAPIRequest(
    apiCall,
    [], // Empty dependency array since apiCall is already memoized
    { refetchInterval: 60000 } // 1 minute
  )
}

// Hook for backend connection status
export function useBackendStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkStatus = useCallback(async () => {
    try {
      const status = await availAPI.refreshBackendStatus()
      setIsConnected(status)
      setLastChecked(new Date())
    } catch {
      setIsConnected(false)
      setLastChecked(new Date())
    }
  }, [])

  useEffect(() => {
    // Check status on mount
    checkStatus()

    // Check status every 60 seconds
    const interval = setInterval(checkStatus, 60000)
    return () => clearInterval(interval)
  }, [checkStatus])

  return {
    isConnected,
    lastChecked,
    checkStatus,
  }
}

// Hook for real-time WebSocket updates
export function useWebSocket(options?: { autoConnect?: boolean }) {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleConnect = () => {
      setConnected(true)
      setError(null)
      console.log('✅ WebSocket connected')
    }

    const handleDisconnect = () => {
      setConnected(false)
      console.log('❌ WebSocket disconnected')
    }

    const handleError = (error: Error) => {
      setConnected(false)
      setError(error?.message || 'WebSocket connection error')
      console.error('WebSocket error:', error)
    }

    // Set up event listeners
    availWS.on('connect', handleConnect)
    availWS.on('disconnect', handleDisconnect)
    availWS.on('connect_error', handleError)

    // Auto-connect if enabled (default: true)
    if (options?.autoConnect !== false) {
      availWS.connect().catch(handleError)
    }

    // Cleanup on unmount
    return () => {
      availWS.off('connect', handleConnect)
      availWS.off('disconnect', handleDisconnect)
      availWS.off('connect_error', handleError)
    }
  }, [options?.autoConnect])

  const subscribe = useCallback(
    (topic: string, subscriptionOptions?: SubscriptionOptions) => {
      availWS.subscribe(topic, subscriptionOptions)
    },
    []
  )

  const unsubscribe = useCallback((topic: string) => {
    availWS.unsubscribe(topic)
  }, [])

  const connect = useCallback(async () => {
    try {
      await availWS.connect()
    } catch (error) {
      setError((error as Error)?.message || 'Failed to connect')
      throw error
    }
  }, [])

  const disconnect = useCallback(() => {
    availWS.disconnect()
  }, [])

  return {
    connected,
    error,
    subscribe,
    unsubscribe,
    connect,
    disconnect,
  }
}
