import axios, { AxiosInstance } from 'axios'

// Types for blockchain data
export interface ChainData {
  finalizedBlocks: number
  signedExtrinsics: number
  stakedAmount: string
  bondedAmount: string
  holders: number
  totalAccounts: number
  transfers: number
  inflationRate: number
  tokenPrice: number
  priceChange: number
  totalIssuance: string
  circulating: { amount: string; percentage: number }
  staking: { amount: string; percentage: number }
  treasury: { amount: string; percentage: number }
  others: { amount: string; percentage: number }
}

export interface Block {
  number: number
  hash: string
  time: number
  extrinsics: number
  parentHash?: string
  stateRoot?: string
}

export interface Extrinsic {
  hash: string
  blockNumber: number
  module: string
  call: string
  success: boolean
  timestamp: number
  signer: string
  fee?: number
  extrinsicIndex?: number
}

export interface Validator {
  address: string
  name?: string
  commission: number
  stake: string
  nominators: number
  isActive: boolean
}

export interface Account {
  address: string
  balance: string
  nonce: number
  reserved: string
  miscFrozen: string
  feeFrozen: string
}

export interface DataSubmission {
  extrinsicId: string
  blockNumber: number
  extrinsicIndex: number
  appId: number
  size: number
  dataHash: string
  submitter: string
  timestamp: number
  success: boolean
}

export interface DataSubmissionStats {
  totalSubmissions: number
  totalDataSize: number
  uniqueApps: number
  uniqueSubmitters: number
  averageSize: number
  submissionsToday: number
  dataSizeToday: number
}

export interface SearchResult {
  type: 'block' | 'extrinsic' | 'account'
  data: Block | Extrinsic | Account
}

// API Response wrapper
export interface APIResponse<T> {
  success: boolean
  data: T
  error?: string
  timestamp: string
}

// Raw API response types (snake_case from backend)
interface RawBlock {
  number: number
  hash: string
  timestamp?: number
  time?: number
  extrinsics_count?: number
  extrinsics?: number
  parent_hash?: string
  parentHash?: string
  state_root?: string
  stateRoot?: string
}

// Configuration
const getConfig = () => ({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1',
  wsURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  isDev: process.env.NEXT_PUBLIC_NODE_ENV === 'development',
  timeout: 10000,
  maxConcurrentRequests: 5, // Limit concurrent requests
  requestQueue: [] as Array<() => Promise<unknown>>,
  activeRequests: 0,
})

// Request throttling utility
class RequestThrottler {
  private maxConcurrent: number
  private activeRequests: number = 0
  private queue: Array<() => Promise<unknown>> = []

  constructor(maxConcurrent: number = 5) {
    this.maxConcurrent = maxConcurrent
  }

  async throttle<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        if (this.activeRequests >= this.maxConcurrent) {
          // Add to queue if too many active requests
          this.queue.push(execute)
          return
        }

        this.activeRequests++
        try {
          const result = await request()
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          this.activeRequests--
          // Process next request in queue
          if (this.queue.length > 0) {
            const nextRequest = this.queue.shift()
            if (nextRequest) {
              setTimeout(nextRequest, 100) // Small delay between requests
            }
          }
        }
      }

      execute()
    })
  }
}

const requestThrottler = new RequestThrottler(5)

// ==== BACKEND API CLIENT ====
class BackendAPIClient {
  private client: AxiosInstance
  private config = getConfig()

  constructor() {
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      config => {
        if (this.config.isDev) {
          console.log(
            `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
          )
        }
        return config
      },
      error => {
        console.error('API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => {
        if (this.config.isDev) {
          console.log(
            `✅ API Response: ${response.status} ${response.config.url}`
          )
        }
        return response
      },
      error => {
        console.error(
          'API Response Error:',
          error.response?.data || error.message
        )

        // Handle common error cases
        if (error.response?.status === 404) {
          throw new Error('Resource not found')
        }
        if (error.response?.status === 500) {
          throw new Error('Server error')
        }
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Backend server is not running')
        }

        throw error
      }
    )
  }

  async getBlocks(page = 0, limit = 10): Promise<Block[]> {
    return requestThrottler.throttle(async () => {
      try {
        const response = await this.client.get<APIResponse<RawBlock[]>>(
          '/blocks',
          {
            params: { page, limit },
          }
        )

        // Transform snake_case to camelCase
        const blocks: Block[] = response.data.data.map(
          (rawBlock: RawBlock) => ({
            number: rawBlock.number,
            hash: rawBlock.hash,
            time: rawBlock.timestamp || rawBlock.time || 0,
            extrinsics: rawBlock.extrinsics_count || rawBlock.extrinsics || 0,
            parentHash: rawBlock.parent_hash || rawBlock.parentHash,
            stateRoot: rawBlock.state_root || rawBlock.stateRoot,
          })
        )

        return blocks
      } catch (error) {
        console.error('Failed to fetch blocks from backend:', error)
        throw error
      }
    })
  }

  async getBlock(numberOrHash: string | number): Promise<Block> {
    try {
      const response = await this.client.get<APIResponse<RawBlock>>(
        `/blocks/${numberOrHash}`
      )
      const rawBlock = response.data.data

      // Transform snake_case to camelCase
      const block: Block = {
        number: rawBlock.number,
        hash: rawBlock.hash,
        time: rawBlock.timestamp || rawBlock.time || 0,
        extrinsics: rawBlock.extrinsics_count || rawBlock.extrinsics || 0,
        parentHash: rawBlock.parent_hash || rawBlock.parentHash,
        stateRoot: rawBlock.state_root || rawBlock.stateRoot,
      }

      return block
    } catch (error) {
      console.error(`Failed to fetch block ${numberOrHash}:`, error)
      throw error
    }
  }

  async getExtrinsics(
    blockNumber?: number,
    page = 0,
    limit = 10
  ): Promise<Extrinsic[]> {
    try {
      const params: Record<string, string | number> = { page, limit }
      if (blockNumber !== undefined) {
        params.block = blockNumber
      }

      const response = await this.client.get<APIResponse<unknown[]>>(
        '/extrinsics',
        { params }
      )

      // Transform snake_case to camelCase and remove id field
      const extrinsics: Extrinsic[] = response.data.data.map(
        (rawExtrinsic: unknown) => {
          const raw = rawExtrinsic as Record<string, unknown>
          return {
            hash: raw.hash as string,
            blockNumber: (raw.block_number || raw.blockNumber) as number,
            module: raw.module as string,
            call: raw.call as string,
            success: raw.success as boolean,
            timestamp: raw.timestamp as number,
            signer: raw.signer as string,
            fee: raw.fee as number | undefined,
            extrinsicIndex: (raw.extrinsic_index || raw.extrinsicIndex) as
              | number
              | undefined,
          }
        }
      )

      return extrinsics
    } catch (error) {
      console.error('Failed to fetch extrinsics from backend:', error)
      throw error
    }
  }

  async getChainStats(): Promise<ChainData> {
    return requestThrottler.throttle(async () => {
      try {
        const response =
          await this.client.get<APIResponse<ChainData>>('/chain/stats')
        return response.data.data
      } catch (error) {
        console.error('Failed to fetch chain stats from backend:', error)
        throw error
      }
    })
  }

  async getValidators(): Promise<Validator[]> {
    try {
      const response =
        await this.client.get<APIResponse<Validator[]>>('/validators')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch validators from backend:', error)
      throw error
    }
  }

  async getAccount(address: string): Promise<Account> {
    try {
      const response = await this.client.get<APIResponse<Account>>(
        `/accounts/${address}`
      )
      return response.data.data
    } catch (error) {
      console.error(`Failed to fetch account ${address}:`, error)
      throw error
    }
  }

  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await this.client.get<APIResponse<SearchResult[]>>(
        '/search',
        {
          params: { q: query },
        }
      )
      return response.data.data
    } catch (error) {
      console.error(`Failed to search for "${query}":`, error)
      throw error
    }
  }

  async getDataSubmissions(
    page = 0,
    limit = 10,
    appId?: number,
    submitter?: string
  ): Promise<DataSubmission[]> {
    return requestThrottler.throttle(async () => {
      try {
        const params: Record<string, string | number> = { page, limit }
        if (appId !== undefined) params.appId = appId
        if (submitter) params.submitter = submitter

        const response = await this.client.get<APIResponse<DataSubmission[]>>(
          '/data-submissions',
          { params }
        )
        return response.data.data
      } catch (error) {
        console.error('Failed to fetch data submissions:', error)
        throw error
      }
    })
  }

  async getDataSubmissionStats(): Promise<DataSubmissionStats> {
    return requestThrottler.throttle(async () => {
      try {
        const response = await this.client.get<
          APIResponse<DataSubmissionStats>
        >('/data-submissions/stats')
        return response.data.data
      } catch (error) {
        console.error('Failed to fetch data submission stats:', error)
        throw error
      }
    })
  }

  async getAnalytics(
    period: '24h' | '7d' | '30d' = '24h'
  ): Promise<Record<string, unknown>> {
    try {
      const response = await this.client.get<
        APIResponse<Record<string, unknown>>
      >('/analytics', {
        params: { period },
      })
      return response.data.data
    } catch {
      console.error('Failed to fetch analytics')
      throw new Error('Failed to fetch analytics')
    }
  }

  // Health check to verify backend connectivity
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health')
      return true
    } catch {
      return false
    }
  }
}

// ==== FRONTEND API ROUTES CLIENT (for fallback) ====
class FrontendAPIClient {
  private baseURL = '' // Use relative URLs for same-origin requests

  async getBlocks(page = 0, limit = 10): Promise<Block[]> {
    try {
      const response = await fetch(`/api/blocks?page=${page}&limit=${limit}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch blocks')
      }

      return data.data
    } catch (error) {
      console.error('Frontend API - Failed to fetch blocks:', error)
      return []
    }
  }

  async getBlock(numberOrHash: string | number): Promise<Block | null> {
    try {
      const response = await fetch(`/api/blocks/${numberOrHash}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch block')
      }

      return data.data
    } catch (error) {
      console.error('Frontend API - Failed to fetch block:', error)
      return null
    }
  }

  async getChainData(): Promise<Partial<ChainData>> {
    try {
      const response = await fetch('/api/chain')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch chain data')
      }

      return data.data
    } catch (error) {
      console.error('Frontend API - Failed to fetch chain data:', error)
      return {}
    }
  }

  async getExtrinsics(
    blockNumber?: number,
    page = 0,
    limit = 10
  ): Promise<Extrinsic[]> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (blockNumber !== undefined) {
        params.append('block', blockNumber.toString())
      }

      const response = await fetch(`/api/extrinsics?${params}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch extrinsics')
      }

      return data.data
    } catch (error) {
      console.error('Frontend API - Failed to fetch extrinsics:', error)
      return []
    }
  }

  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to search')
      }

      return data.data
    } catch (error) {
      console.error('Frontend API - Failed to search:', error)
      return []
    }
  }

  async getDataSubmissions(
    page = 0,
    limit = 10,
    appId?: number,
    submitter?: string
  ): Promise<DataSubmission[]> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (appId !== undefined) params.append('appId', appId.toString())
      if (submitter) params.append('submitter', submitter)

      const response = await fetch(`/api/data-submissions?${params}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch data submissions')
      }

      return data.data
    } catch (error) {
      console.error('Frontend API - Failed to fetch data submissions:', error)
      return []
    }
  }

  async getDataSubmissionStats(): Promise<DataSubmissionStats | null> {
    try {
      const response = await fetch('/api/data-submissions/stats')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch data submission stats')
      }

      return data.data
    } catch (error) {
      console.error(
        'Frontend API - Failed to fetch data submission stats:',
        error
      )
      return null
    }
  }
}

// ==== UNIFIED API CLIENT WITH PROPER FALLBACK ====
export class AvailAPI {
  private backend: BackendAPIClient
  private frontend: FrontendAPIClient
  private useBackend: boolean = true
  private healthCheckPromise: Promise<void>

  constructor() {
    this.backend = new BackendAPIClient()
    this.frontend = new FrontendAPIClient()
    this.healthCheckPromise = this.checkBackendHealth()
  }

  private async checkBackendHealth() {
    try {
      this.useBackend = await this.backend.healthCheck()
      if (!this.useBackend) {
        console.warn(
          '⚠️  Backend is not available, using Next.js API routes as fallback'
        )
      } else {
        console.log('✅ Backend is available')
      }
    } catch {
      console.warn(
        '⚠️  Backend health check failed, using Next.js API routes as fallback'
      )
      this.useBackend = false
    }
  }

  async getLatestBlocks(count = 10): Promise<Block[]> {
    try {
      if (this.useBackend) {
        return await this.backend.getBlocks(0, count)
      } else {
        return await this.frontend.getBlocks(0, count)
      }
    } catch (error) {
      console.error(
        'Failed to fetch blocks from backend, trying frontend API...'
      )
      if (this.useBackend) {
        this.useBackend = false
        return await this.frontend.getBlocks(0, count)
      }
      throw error
    }
  }

  async getBlock(numberOrHash: string | number): Promise<Block | null> {
    try {
      // Wait for health check to complete
      await this.healthCheckPromise

      if (this.useBackend) {
        return await this.backend.getBlock(numberOrHash)
      } else {
        return await this.frontend.getBlock(numberOrHash)
      }
    } catch (error) {
      console.error(
        'Failed to fetch block from backend, trying frontend API...',
        error
      )
      if (this.useBackend) {
        this.useBackend = false
        return await this.frontend.getBlock(numberOrHash)
      }
      return null
    }
  }

  async getExtrinsics(
    blockNumber?: number,
    page = 0,
    limit = 10
  ): Promise<Extrinsic[]> {
    try {
      if (this.useBackend) {
        return await this.backend.getExtrinsics(blockNumber, page, limit)
      } else {
        return await this.frontend.getExtrinsics(blockNumber, page, limit)
      }
    } catch (error) {
      console.error('Failed to fetch extrinsics:', error)
      if (this.useBackend) {
        this.useBackend = false
        return await this.frontend.getExtrinsics(blockNumber, page, limit)
      }
      return []
    }
  }

  async getChainData(): Promise<ChainData> {
    // Default fallback data (only used if all APIs fail)
    const fallbackData: ChainData = {
      finalizedBlocks: 0,
      signedExtrinsics: 0,
      stakedAmount: '0',
      bondedAmount: '0',
      holders: 0,
      totalAccounts: 0,
      transfers: 0,
      inflationRate: 0,
      tokenPrice: 0,
      priceChange: 0,
      totalIssuance: '0',
      circulating: { amount: '0', percentage: 0 },
      staking: { amount: '0', percentage: 0 },
      treasury: { amount: '0', percentage: 0 },
      others: { amount: '0', percentage: 0 },
    }

    try {
      let data: Partial<ChainData> = {}

      if (this.useBackend) {
        console.log('🔄 Fetching chain data from backend...')
        data = await this.backend.getChainStats()
        console.log('✅ Backend data received:', data)
      } else {
        console.log('🔄 Fetching chain data from frontend API...')
        data = await this.frontend.getChainData()
        console.log('✅ Frontend API data received:', data)
      }

      // Merge with fallback data, prioritizing API data
      const result = { ...fallbackData, ...data }
      console.log('📊 Final chain data:', result)
      return result
    } catch (error) {
      console.error('❌ Failed to fetch chain data from primary source:', error)

      if (this.useBackend) {
        console.log('🔄 Trying frontend API as fallback...')
        this.useBackend = false
        try {
          const data = await this.frontend.getChainData()
          console.log('✅ Frontend API fallback data received:', data)
          return { ...fallbackData, ...data }
        } catch (frontendError) {
          console.error('❌ Frontend API also failed:', frontendError)
        }
      }

      console.warn('⚠️ All API sources failed, using fallback data')
      return fallbackData
    }
  }

  async getValidators(): Promise<Validator[]> {
    try {
      if (this.useBackend) {
        return await this.backend.getValidators()
      }
      return []
    } catch (error) {
      console.error('Failed to fetch validators:', error)
      return []
    }
  }

  async getAccount(address: string): Promise<Account | null> {
    try {
      if (this.useBackend) {
        return await this.backend.getAccount(address)
      }
      return null
    } catch (error) {
      console.error('Failed to fetch account:', error)
      return null
    }
  }

  async search(query: string): Promise<SearchResult[]> {
    try {
      if (this.useBackend) {
        return await this.backend.search(query)
      } else {
        return await this.frontend.search(query)
      }
    } catch (error) {
      console.error('Failed to search:', error)
      if (this.useBackend) {
        this.useBackend = false
        return await this.frontend.search(query)
      }
      return []
    }
  }

  async getDataSubmissions(
    page = 0,
    limit = 10,
    appId?: number,
    submitter?: string
  ): Promise<DataSubmission[]> {
    try {
      if (this.useBackend) {
        return await this.backend.getDataSubmissions(
          page,
          limit,
          appId,
          submitter
        )
      } else {
        return await this.frontend.getDataSubmissions(
          page,
          limit,
          appId,
          submitter
        )
      }
    } catch (error) {
      console.error('Failed to fetch data submissions:', error)
      if (this.useBackend) {
        this.useBackend = false
        return await this.frontend.getDataSubmissions(
          page,
          limit,
          appId,
          submitter
        )
      }
      return []
    }
  }

  async getDataSubmissionStats(): Promise<DataSubmissionStats | null> {
    try {
      if (this.useBackend) {
        return await this.backend.getDataSubmissionStats()
      } else {
        return await this.frontend.getDataSubmissionStats()
      }
    } catch (error) {
      console.error('Failed to fetch data submission stats:', error)
      if (this.useBackend) {
        this.useBackend = false
        return await this.frontend.getDataSubmissionStats()
      }
      return null
    }
  }

  async getAnalytics(
    period: '24h' | '7d' | '30d' = '24h'
  ): Promise<Record<string, unknown> | null> {
    try {
      if (this.useBackend) {
        return await this.backend.getAnalytics(period)
      }
      return null
    } catch {
      console.error('Failed to fetch analytics')
      return null
    }
  }

  // Force refresh backend health status
  async refreshBackendStatus(): Promise<boolean> {
    await this.checkBackendHealth()
    return this.useBackend
  }

  // Get current backend status
  isBackendAvailable(): boolean {
    return this.useBackend
  }
}

// Export singleton instance
export const availAPI = new AvailAPI()

// WebSocket client for real-time updates
export class AvailWebSocket {
  private ws: WebSocket | null = null
  private config = getConfig()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect(
    onMessage?: (data: Record<string, unknown>) => void,
    onError?: (error: Event) => void
  ) {
    try {
      this.ws = new WebSocket(this.config.wsURL)

      this.ws.onopen = () => {
        console.log('🔌 WebSocket connected')
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data)
          onMessage?.(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onerror = error => {
        console.error('WebSocket error:', error)
        onError?.(error)
      }

      this.ws.onclose = event => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason)
        this.attemptReconnect(onMessage, onError)
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      onError?.(error as Event)
    }
  }

  private attemptReconnect(
    onMessage?: (data: Record<string, unknown>) => void,
    onError?: (error: Event) => void
  ) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(
        `🔄 Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      )

      setTimeout(() => {
        this.connect(onMessage, onError)
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error('❌ Max WebSocket reconnection attempts reached')
    }
  }

  subscribe(topic: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', topic }))
    }
  }

  unsubscribe(topic: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', topic }))
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Export WebSocket instance
export const availWS = new AvailWebSocket()
