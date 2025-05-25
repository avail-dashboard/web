import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  availAPI,
  availWS,
  Block,
  ChainData,
  Extrinsic,
  Validator,
  Account,
  SearchResult,
} from '../api'

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

export function useChainData(options?: { refetchInterval?: number }) {
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

export function useAnalytics(period: '24h' | '7d' | '30d' = '24h') {
  // Memoize the API call function
  const apiCall = useCallback(() => availAPI.getAnalytics(period), [period])

  return useAPIRequest(
    apiCall,
    [], // Empty dependency array since apiCall is already memoized
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
    autoConnect = true,
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
    unsubscribe,
  }
}
