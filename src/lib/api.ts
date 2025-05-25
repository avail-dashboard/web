import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

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

// Configuration
const getConfig = () => ({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1',
  wsURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  isDev: process.env.NEXT_PUBLIC_NODE_ENV === 'development',
  timeout: 10000,
})

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
      (config) => {
        if (this.config.isDev) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
        }
        return config
      },
      (error) => {
        console.error('API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        if (this.config.isDev) {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`)
        }
        return response
      },
      (error) => {
        console.error('API Response Error:', error.response?.data || error.message)
        
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
    try {
      const response = await this.client.get<APIResponse<Block[]>>('/blocks', {
        params: { page, limit }
      })
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch blocks from backend:', error)
      throw error
    }
  }

  async getBlock(numberOrHash: string | number): Promise<Block> {
    try {
      const response = await this.client.get<APIResponse<Block>>(`/blocks/${numberOrHash}`)
      return response.data.data
    } catch (error) {
      console.error(`Failed to fetch block ${numberOrHash}:`, error)
      throw error
    }
  }

  async getExtrinsics(blockNumber?: number, page = 0, limit = 10): Promise<Extrinsic[]> {
    try {
      const params: any = { page, limit }
      if (blockNumber !== undefined) {
        params.block = blockNumber
      }
      
      const response = await this.client.get<APIResponse<Extrinsic[]>>('/extrinsics', { params })
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch extrinsics from backend:', error)
      throw error
    }
  }

  async getChainStats(): Promise<ChainData> {
    try {
      const response = await this.client.get<APIResponse<ChainData>>('/chain/stats')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch chain stats from backend:', error)
      throw error
    }
  }

  async getValidators(): Promise<Validator[]> {
    try {
      const response = await this.client.get<APIResponse<Validator[]>>('/validators')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch validators from backend:', error)
      throw error
    }
  }

  async getAccount(address: string): Promise<Account> {
    try {
      const response = await this.client.get<APIResponse<Account>>(`/accounts/${address}`)
      return response.data.data
    } catch (error) {
      console.error(`Failed to fetch account ${address}:`, error)
      throw error
    }
  }

  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await this.client.get<APIResponse<SearchResult[]>>('/search', {
        params: { q: query }
      })
      return response.data.data
    } catch (error) {
      console.error(`Failed to search for "${query}":`, error)
      throw error
    }
  }

  async getAnalytics(period: '24h' | '7d' | '30d' = '24h'): Promise<any> {
    try {
      const response = await this.client.get<APIResponse<any>>('/analytics', {
        params: { period }
      })
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      throw error
    }
  }

  // Health check to verify backend connectivity
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health')
      return true
    } catch (error) {
      return false
    }
  }
}

// ==== FALLBACK API CLIENTS (for when backend is not available) ====
class SubscanFallbackAPI {
  private baseURL = 'https://avail.api.subscan.io'
  private headers = {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.SUBSCAN_API_KEY || ''
  }

  async getBlocks(page = 0, limit = 10): Promise<Block[]> {
    try {
      const response = await axios.post(`${this.baseURL}/api/scan/blocks`, {
        row: limit,
        page: page
      }, { headers: this.headers })

      return response.data.data?.blocks?.map((block: any) => ({
        number: block.block_num,
        hash: block.hash,
        time: block.block_timestamp * 1000,
        extrinsics: block.extrinsics_count || 0,
        parentHash: block.parent_hash,
        stateRoot: block.state_root
      })) || []
    } catch (error) {
      console.error('Subscan API error:', error)
      return []
    }
  }

  async getChainData(): Promise<Partial<ChainData>> {
    try {
      const statsResponse = await axios.post(`${this.baseURL}/api/scan/metadata`, {}, { headers: this.headers })
      const stats = statsResponse.data.data

      // Get token price from CoinGecko
      const priceResponse = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=avail&vs_currencies=usd&include_24hr_change=true'
      )
      const priceData = priceResponse.data.avail

      return {
        finalizedBlocks: stats?.blockNum || 0,
        signedExtrinsics: stats?.extrinsicsCount || 0,
        totalAccounts: stats?.accountsCount || 0,
        transfers: stats?.transfersCount || 0,
        tokenPrice: priceData?.usd || 0,
        priceChange: priceData?.usd_24h_change || 0
      }
    } catch (error) {
      console.error('Subscan fallback API error:', error)
      return {}
    }
  }
}

// ==== UNIFIED API CLIENT WITH FALLBACK ====
export class AvailAPI {
  private backend: BackendAPIClient
  private fallback: SubscanFallbackAPI
  private useBackend: boolean = true

  constructor() {
    this.backend = new BackendAPIClient()
    this.fallback = new SubscanFallbackAPI()
    this.checkBackendHealth()
  }

  private async checkBackendHealth() {
    try {
      this.useBackend = await this.backend.healthCheck()
      if (!this.useBackend) {
        console.warn('⚠️  Backend is not available, using fallback APIs')
      } else {
        console.log('✅ Backend is available')
      }
    } catch (error) {
      console.warn('⚠️  Backend health check failed, using fallback APIs')
      this.useBackend = false
    }
  }

  async getLatestBlocks(count = 10): Promise<Block[]> {
    try {
      if (this.useBackend) {
        return await this.backend.getBlocks(0, count)
      } else {
        return await this.fallback.getBlocks(0, count)
      }
    } catch (error) {
      console.error('Failed to fetch blocks, trying fallback...')
      if (this.useBackend) {
        this.useBackend = false
        return await this.fallback.getBlocks(0, count)
      }
      throw error
    }
  }

  async getBlock(numberOrHash: string | number): Promise<Block | null> {
    try {
      if (this.useBackend) {
        return await this.backend.getBlock(numberOrHash)
      }
      // Fallback doesn't support single block fetch easily
      throw new Error('Block detail not available without backend')
    } catch (error) {
      console.error('Failed to fetch block:', error)
      return null
    }
  }

  async getExtrinsics(blockNumber?: number, page = 0, limit = 10): Promise<Extrinsic[]> {
    try {
      if (this.useBackend) {
        return await this.backend.getExtrinsics(blockNumber, page, limit)
      }
      // Fallback implementation would need to be added
      return []
    } catch (error) {
      console.error('Failed to fetch extrinsics:', error)
      return []
    }
  }

  async getChainData(): Promise<ChainData> {
    const mockData: ChainData = {
      finalizedBlocks: 1399813,
      signedExtrinsics: 576934,
      stakedAmount: '5.383B',
      bondedAmount: '5.386B',
      holders: 203302,
      totalAccounts: 288348,
      transfers: 643469,
      inflationRate: 4.22,
      tokenPrice: 0.03645154,
      priceChange: -4.81,
      totalIssuance: '10.442B',
      circulating: { amount: '4.819B', percentage: 46.14 },
      staking: { amount: '5.386B', percentage: 51.57 },
      treasury: { amount: '230.471M', percentage: 2.20 },
      others: { amount: '7.209M', percentage: 0.06 }
    }

    try {
      let data: Partial<ChainData>
      
      if (this.useBackend) {
        data = await this.backend.getChainStats()
      } else {
        data = await this.fallback.getChainData()
      }

      return { ...mockData, ...data }
    } catch (error) {
      console.error('Failed to fetch chain data, using mock data:', error)
      return mockData
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
      }
      return []
    } catch (error) {
      console.error('Failed to search:', error)
      return []
    }
  }

  async getAnalytics(period: '24h' | '7d' | '30d' = '24h'): Promise<any> {
    try {
      if (this.useBackend) {
        return await this.backend.getAnalytics(period)
      }
      return null
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
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

  connect(onMessage?: (data: any) => void, onError?: (error: Event) => void) {
    try {
      this.ws = new WebSocket(this.config.wsURL)

      this.ws.onopen = () => {
        console.log('🔌 WebSocket connected')
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage?.(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        onError?.(error)
      }

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason)
        this.attemptReconnect(onMessage, onError)
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      onError?.(error as Event)
    }
  }

  private attemptReconnect(onMessage?: (data: any) => void, onError?: (error: Event) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`🔄 Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
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