import { useState, useEffect, useCallback } from 'react'
import { availAPI, Block, ChainData } from '../api'
import { availWS, SubscriptionOptions } from '@/lib/websocket'
import { AxiosError } from 'axios'

// Interface for API error response
interface ApiErrorResponse {
  error?: {
    message?: string
    code?: string
  }
  message?: string
}

// Generic hook for API requests with loading and error states
export function useAPIRequest<T>(
  apiCall: () => Promise<T>,
  dependencies: unknown[] = [],
  options: {
    enabled?: boolean
    refetchInterval?: number
    preserveDataOnError?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
  } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const {
    enabled = true,
    refetchInterval,
    preserveDataOnError = true,
    onSuccess,
    onError,
  } = options

  // Memoize the API call to prevent infinite loops
  const memoizedApiCall = useCallback(apiCall, dependencies)

  const fetchData = useCallback(
    async (isManualRefetch = false) => {
      if (!enabled) return

      // For initial load or manual refetch, show loading
      // For automatic refetch, show refreshing instead
      if (isInitialLoad || isManualRefetch) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      setError(null)

      try {
        const result = await memoizedApiCall()
        setData(result)
        setIsInitialLoad(false)
        onSuccess?.(result)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')

        // Enhanced error information
        let enhancedError = error
        if (err && typeof err === 'object') {
          const axiosError = err as AxiosError
          if (axiosError.code === 'ECONNABORTED') {
            enhancedError = new Error(
              `Request timeout: The server took too long to respond (${axiosError.config?.timeout || 30000}ms)`
            )
          } else if (axiosError.code === 'ECONNREFUSED') {
            enhancedError = new Error(
              'Connection refused: Unable to connect to the backend server'
            )
          } else if (axiosError.response) {
            const status = axiosError.response.status
            const statusText = axiosError.response.statusText
            const data = axiosError.response.data as ApiErrorResponse

            if (status === 404) {
              enhancedError = new Error(
                'Data not found: The requested resource could not be located'
              )
            } else if (status === 500) {
              enhancedError = new Error(
                `Server error (${status}): ${data?.error?.message || statusText || 'Internal server error'}`
              )
            } else if (status === 503) {
              enhancedError = new Error(
                'Service unavailable: The backend service is temporarily offline'
              )
            } else if (status >= 400 && status < 500) {
              enhancedError = new Error(
                `Client error (${status}): ${data?.error?.message || statusText || 'Bad request'}`
              )
            } else if (status >= 500) {
              enhancedError = new Error(
                `Server error (${status}): ${data?.error?.message || statusText || 'Server error'}`
              )
            }
          } else if (axiosError.request) {
            enhancedError = new Error(
              'Network error: No response received from server. Check your internet connection.'
            )
          }
        }

        setError(enhancedError)

        // Log detailed error information for debugging
        if (process.env.NODE_ENV === 'development') {
          console.group('🔴 API Error Details')
          console.error('Enhanced Error:', enhancedError.message)
          console.error('Original Error:', error)
          if (err && typeof err === 'object') {
            const axiosError = err as AxiosError
            if (axiosError.response) {
              console.error('Response Status:', axiosError.response.status)
              console.error('Response Data:', axiosError.response.data)
            }
            if (axiosError.config) {
              console.error('Request URL:', axiosError.config.url)
              console.error('Request Method:', axiosError.config.method)
            }
          }
          console.groupEnd()
        }

        // Only reset data if preserveDataOnError is false
        if (!preserveDataOnError) {
          setData(null)
        }
        onError?.(enhancedError)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [
      memoizedApiCall,
      enabled,
      preserveDataOnError,
      onSuccess,
      onError,
      isInitialLoad,
    ]
  )

  // Manual refetch function
  const refetch = useCallback(() => fetchData(true), [fetchData])

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchData(false)
  }, [fetchData])

  // Set up interval if specified
  useEffect(() => {
    if (!refetchInterval || !enabled) return

    const interval = setInterval(() => fetchData(false), refetchInterval)
    return () => clearInterval(interval)
  }, [fetchData, refetchInterval, enabled])

  return {
    data,
    loading,
    refreshing,
    error,
    refetch,
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
  const { refetchInterval = 15000, onNewBlock } = options || {} // Standardized to 15s

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
  refreshing: boolean
  error: Error | null
  refetch: () => Promise<void>
} {
  const { refetchInterval = 60000 } = options || {} // Standardized to 60s

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

export function useExtrinsics(blockNumber?: number) {
  // Memoize the API call function
  const apiCall = useCallback(
    () => {
      if (blockNumber) {
        // Use the specific block extrinsics endpoint for better performance
        return availAPI.getBlockExtrinsics(blockNumber)
      } else {
        // Use the general extrinsics endpoint for listing all extrinsics
        return availAPI.getExtrinsics(undefined, 1, 20)
      }
    },
    [blockNumber]
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
  const [isConnected, setIsConnected] = useState<boolean | null>(null) // Start with null to indicate "checking"
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
    isConnected: isConnected ?? false, // Convert null to false for backward compatibility
    isChecking: isConnected === null,
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

    const handleConnectError = (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'WebSocket connection error'
      setConnected(false)
      setError(errorMessage)
      console.error('WebSocket connect error:', error)
    }

    // Set up event listeners
    availWS.on('connect', handleConnect)
    availWS.on('disconnect', handleDisconnect)
    availWS.on('connect_error', handleConnectError)

    // Auto-connect if enabled (default: true)
    if (options?.autoConnect !== false) {
      availWS.connect().catch(handleError)
    }

    // Cleanup on unmount
    return () => {
      availWS.off('connect', handleConnect)
      availWS.off('disconnect', handleDisconnect)
      availWS.off('connect_error', handleConnectError)
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
