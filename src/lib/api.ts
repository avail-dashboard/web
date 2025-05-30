import axios, { AxiosInstance, AxiosResponse } from 'axios'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging and auth
api.interceptors.request.use(
  config => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  error => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  error => {
    console.error('API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Types for API responses
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface Block {
  id: string
  number: number
  hash: string
  parentHash: string
  stateRoot: string
  extrinsicsRoot: string
  timestamp: string
  validator: string
  specVersion: number
  extrinsicsCount: number
  eventsCount: number
  size: number
  status: 'finalized' | 'pending'
}

export interface Extrinsic {
  id: string
  hash: string
  blockNumber: number
  blockHash: string
  index: number
  method: string
  section: string
  args: Record<string, unknown>[]
  signer: string
  nonce: number
  signature: string
  tip: string
  fee: string
  success: boolean
  timestamp: string
  events: Event[]
}

export interface Event {
  id: string
  blockNumber: number
  extrinsicIndex?: number
  eventIndex: number
  section: string
  method: string
  data: Record<string, unknown>[]
  phase: string
  topics: string[]
}

export interface Account {
  address: string
  balance: {
    free: string
    reserved: string
    frozen: string
  }
  nonce: number
  extrinsicsCount: number
  transfersCount: number
  identity?: {
    display?: string
    legal?: string
    web?: string
    riot?: string
    email?: string
    twitter?: string
  }
}

export interface Transfer {
  id: string
  from: string
  to: string
  amount: string
  blockNumber: number
  timestamp: string
  extrinsicHash: string
  success: boolean
}

export interface DataSubmission {
  id: string
  extrinsicHash: string
  blockNumber: number
  submitter: string
  appId: number
  data: string
  dataHash: string
  size: number
  timestamp: string
  rollupName?: string
}

export interface Validator {
  address: string
  identity?: {
    display?: string
    legal?: string
    web?: string
    riot?: string
    email?: string
    twitter?: string
  }
  commission: string
  totalStake: string
  ownStake: string
  nominatorsCount: number
  blocksProduced: number
  active: boolean
  waiting: boolean
  slashed: boolean
  sessionKeys: string[]
}

export interface NetworkStats {
  totalBlocks: number
  totalExtrinsics: number
  totalAccounts: number
  totalValidators: number
  activeValidators: number
  totalStaked: string
  averageBlockTime: number
  totalDataSubmissions: number
  totalBlobSize: string
}

export interface RollupStats {
  appId: number
  name: string
  totalSubmissions: number
  totalSize: string
  totalFees: string
  lastActive: string
  firstSeen: string
  averageSize: string
  submissionsToday: number
  feesToday: string
}

export interface GasTrackerData {
  timestamp: string
  averageGasPrice: string
  gasUsed: string
  gasLimit: string
  efficiency: number
}

export interface DataThroughputData {
  timestamp: string
  totalSize: string
  submissionCount: number
  averageSize: string
}

// API Functions

// Blocks API
export const blocksApi = {
  getBlocks: (params?: {
    page?: number
    limit?: number
    validator?: string
    status?: string
  }): Promise<PaginatedResponse<Block>> =>
    api.get('/api/v1/blocks', { params }).then(res => res.data),

  getBlock: (identifier: string): Promise<Block> =>
    api.get(`/api/v1/blocks/${identifier}`).then(res => res.data),

  getLatestBlocks: (limit = 10): Promise<Block[]> =>
    api
      .get('/api/v1/blocks', { params: { page: 1, limit } })
      .then(res => res.data?.data || []),
}

// Extrinsics API
export const extrinsicsApi = {
  getExtrinsics: (params?: {
    page?: number
    limit?: number
    block?: number
    signer?: string
    method?: string
    success?: boolean
  }): Promise<PaginatedResponse<Extrinsic>> =>
    api.get('/api/v1/extrinsics', { params }).then(res => res.data),

  getExtrinsic: (hash: string): Promise<Extrinsic> =>
    api.get(`/api/v1/extrinsics/${hash}`).then(res => res.data),

  getLatestExtrinsics: (limit = 10): Promise<Extrinsic[]> =>
    api
      .get('/api/v1/extrinsics', { params: { page: 1, limit } })
      .then(res => res.data?.data || []),
}

// Accounts API
export const accountsApi = {
  getAccounts: (params?: {
    page?: number
    limit?: number
    orderBy?: string
  }): Promise<PaginatedResponse<Account>> =>
    api.get('/api/v1/accounts', { params }).then(res => res.data),

  getAccount: (address: string): Promise<Account> =>
    api.get(`/api/v1/accounts/${address}`).then(res => res.data),

  getAccountExtrinsics: (
    address: string,
    params?: {
      page?: number
      limit?: number
    }
  ): Promise<PaginatedResponse<Extrinsic>> =>
    api
      .get(`/api/v1/accounts/${address}/extrinsics`, { params })
      .then(res => res.data),

  getAccountTransfers: (
    address: string,
    params?: {
      page?: number
      limit?: number
    }
  ): Promise<PaginatedResponse<Transfer>> =>
    api
      .get(`/api/v1/accounts/${address}/transfers`, { params })
      .then(res => res.data),
}

// Data Submissions API
export const dataSubmissionsApi = {
  getDataSubmissions: (params?: {
    page?: number
    limit?: number
    appId?: number
    submitter?: string
  }): Promise<PaginatedResponse<DataSubmission>> =>
    api.get('/api/v1/data-submissions', { params }).then(res => res.data),

  getDataSubmission: (id: string): Promise<DataSubmission> =>
    api.get(`/api/v1/data-submissions/${id}`).then(res => res.data),

  getLatestDataSubmissions: (limit = 10): Promise<DataSubmission[]> =>
    api
      .get(`/api/v1/data-submissions/latest?limit=${limit}`)
      .then(res => res.data),
}

// Validators API
export const validatorsApi = {
  getValidators: (params?: {
    page?: number
    limit?: number
    active?: boolean
    orderBy?: string
  }): Promise<PaginatedResponse<Validator>> =>
    api.get('/api/v1/validators', { params }).then(res => res.data),

  getValidator: (address: string): Promise<Validator> =>
    api.get(`/api/v1/validators/${address}`).then(res => res.data),

  getValidatorBlocks: (
    address: string,
    params?: {
      page?: number
      limit?: number
    }
  ): Promise<PaginatedResponse<Block>> =>
    api
      .get(`/api/v1/validators/${address}/blocks`, { params })
      .then(res => res.data),
}

// Analytics API
export const analyticsApi = {
  getNetworkStats: (): Promise<NetworkStats> =>
    api.get('/api/v1/analytics/network').then(res => res.data),

  getRollupStats: (params?: {
    period?: '24h' | '7d' | '30d'
  }): Promise<RollupStats[]> =>
    api.get('/api/v1/analytics/rollups', { params }).then(res => res.data),

  getGasTracker: (params?: {
    period?: '24h' | '7d'
  }): Promise<GasTrackerData[]> =>
    api.get('/api/v1/analytics/gas', { params }).then(res => res.data),

  getDataThroughput: (params?: {
    period?: '24h' | '7d' | '30d'
  }): Promise<DataThroughputData[]> =>
    api.get('/api/v1/analytics/throughput', { params }).then(res => res.data),
}

// Search API
export const searchApi = {
  search: (
    query: string
  ): Promise<{
    blocks: Block[]
    extrinsics: Extrinsic[]
    accounts: Account[]
    validators: Validator[]
  }> =>
    api
      .get(`/api/v1/search?q=${encodeURIComponent(query)}`)
      .then(res => res.data),
}

// Export the main api instance for custom requests
export default api

// Export the unified API interface that hooks expect
export const availAPI = {
  getChainData: async () => {
    try {
      const response = await fetch('/api/chain')
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to fetch chain data:', error)
      throw error
    }
  },

  getLatestBlocks: async (count: number = 10) => {
    try {
      const response = await blocksApi.getLatestBlocks(count)
      return response || []
    } catch (error) {
      console.error('Failed to fetch latest blocks:', error)
      throw error
    }
  },

  getBlock: async (numberOrHash: string | number) => {
    try {
      const response = await blocksApi.getBlock(numberOrHash.toString())
      return response
    } catch (error) {
      console.error('Failed to fetch block:', error)
      throw error
    }
  },

  getExtrinsics: async (
    blockNumber?: number,
    page: number = 0,
    limit: number = 10
  ) => {
    try {
      const params: { page: number; limit: number; block?: number } = {
        page,
        limit,
      }
      if (blockNumber) {
        params.block = blockNumber
      }
      const response = await extrinsicsApi.getExtrinsics(params)
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch extrinsics:', error)
      throw error
    }
  },

  getValidators: async () => {
    try {
      const response = await validatorsApi.getValidators({
        page: 1,
        limit: 100,
      })
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch validators:', error)
      throw error
    }
  },

  getAccount: async (address: string) => {
    try {
      const response = await accountsApi.getAccount(address)
      return response
    } catch (error) {
      console.error('Failed to fetch account:', error)
      throw error
    }
  },

  search: async (query: string) => {
    try {
      const response = await searchApi.search(query)
      return response || []
    } catch (error) {
      console.error('Failed to search:', error)
      throw error
    }
  },

  getAnalytics: async () => {
    try {
      const response = await analyticsApi.getNetworkStats()
      return response
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      throw error
    }
  },

  refreshBackendStatus: async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      return data?.backend?.available || false
    } catch {
      return false
    }
  },
}

// Mock WebSocket for now - this can be enhanced later
export const availWS = {
  connect: () => {
    console.log('WebSocket connection would be established here')
  },

  disconnect: () => {
    console.log('WebSocket would be disconnected here')
  },

  subscribe: (topic: string) => {
    console.log(`Would subscribe to topic: ${topic}`)
  },

  unsubscribe: (topic: string) => {
    console.log(`Would unsubscribe from topic: ${topic}`)
  },
}
