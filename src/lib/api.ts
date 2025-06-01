import axios, { AxiosInstance, AxiosResponse } from 'axios'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

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
  time: number
  validator: string
  specVersion: number
  extrinsicsCount: number
  extrinsics: number
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
  module: string
  call: string
  extrinsicIndex?: number
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
  timestamp: number
  extrinsicHash: string
  success: boolean
  fee: number
}

export interface DataSubmission {
  extrinsicId: string
  blockNumber: number
  extrinsicIndex: number
  submitter: string
  appId: number
  dataHash: string
  size: number
  timestamp: number
  success: boolean
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
    api.get('/blocks', { params }).then(res => res.data),

  getBlock: (identifier: string): Promise<Block> =>
    api.get(`/blocks/${identifier}`).then(res => res.data),

  getLatestBlocks: (limit = 10): Promise<Block[]> =>
    api
      .get('/blocks', { params: { page: 1, limit } })
      .then(res => res.data?.data || []),
}

// Extrinsics API
export const extrinsicsApi = {
  getExtrinsics: (params?: {
    block?: number
    signer?: string
    method?: string
    success?: boolean
  }): Promise<Extrinsic[]> =>
    api
      .get('/extrinsics', { params })
      .then(res => res.data?.data || res.data || []),

  getExtrinsic: (hash: string): Promise<Extrinsic> =>
    api.get(`/extrinsics/${hash}`).then(res => res.data),

  getLatestExtrinsics: (limit = 10): Promise<Extrinsic[]> =>
    api.get('/extrinsics').then(res => {
      const allExtrinsics = res.data?.data || res.data || []
      return Array.isArray(allExtrinsics) ? allExtrinsics.slice(0, limit) : []
    }),
}

// Accounts API
export const accountsApi = {
  getAccounts: (params?: {
    page?: number
    limit?: number
    orderBy?: string
  }): Promise<PaginatedResponse<Account>> =>
    api.get('/accounts', { params }).then(res => res.data),

  getAccount: (address: string): Promise<Account> =>
    api.get(`/accounts/${address}`).then(res => res.data),

  getAccountExtrinsics: (
    address: string,
    params?: {
      page?: number
      limit?: number
    }
  ): Promise<PaginatedResponse<Extrinsic>> =>
    api
      .get(`/accounts/${address}/extrinsics`, { params })
      .then(res => res.data),

  getAccountTransfers: (
    address: string,
    params?: {
      page?: number
      limit?: number
    }
  ): Promise<PaginatedResponse<Transfer>> =>
    api.get(`/accounts/${address}/transfers`, { params }).then(res => res.data),
}

// Data Submissions API
export const dataSubmissionsApi = {
  getDataSubmissions: (params?: {
    page?: number
    limit?: number
    appId?: number
    submitter?: string
  }): Promise<PaginatedResponse<DataSubmission>> =>
    api.get('/data-submissions', { params }).then(res => res.data),

  getDataSubmission: (id: string): Promise<DataSubmission> =>
    api.get(`/data-submissions/${id}`).then(res => res.data),

  getLatestDataSubmissions: (limit = 10): Promise<DataSubmission[]> =>
    api.get(`/data-submissions/latest?limit=${limit}`).then(res => res.data),
}

// Validators API
export const validatorsApi = {
  getValidators: (params?: {
    page?: number
    limit?: number
    active?: boolean
    orderBy?: string
  }): Promise<PaginatedResponse<Validator>> =>
    api.get('/validators', { params }).then(res => res.data),

  getValidator: (address: string): Promise<Validator> =>
    api.get(`/validators/${address}`).then(res => res.data),

  getValidatorBlocks: (
    address: string,
    params?: {
      page?: number
      limit?: number
    }
  ): Promise<PaginatedResponse<Block>> =>
    api.get(`/validators/${address}/blocks`, { params }).then(res => res.data),
}

// Analytics API
export const analyticsApi = {
  getNetworkStats: (): Promise<NetworkStats> =>
    api.get('/analytics/network').then(res => res.data),

  getRollupStats: (params?: {
    period?: '24h' | '7d' | '30d'
  }): Promise<RollupStats[]> =>
    api.get('/analytics/rollups', { params }).then(res => res.data),

  getGasTracker: (params?: {
    period?: '24h' | '7d'
  }): Promise<GasTrackerData[]> =>
    api.get('/analytics/gas', { params }).then(res => res.data),

  getDataThroughput: (params?: {
    period?: '24h' | '7d' | '30d'
  }): Promise<DataThroughputData[]> =>
    api.get('/analytics/throughput', { params }).then(res => res.data),
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
  }> => api.get(`/search?q=${encodeURIComponent(query)}`).then(res => res.data),
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
      const params: { block?: number } = {}
      if (blockNumber) {
        params.block = blockNumber
      }
      const response = await extrinsicsApi.getExtrinsics(params)
      // Since we now get all extrinsics, slice for the requested limit if needed
      return Array.isArray(response)
        ? response.slice(page * limit, (page + 1) * limit)
        : []
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

  getDataSubmissions: async (
    page: number = 0,
    limit: number = 20,
    appId?: number,
    submitter?: string
  ) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (appId) params.append('appId', appId.toString())
      if (submitter) params.append('submitter', submitter)

      const response = await fetch(`/api/data-submissions?${params}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch data submissions')
      }

      return data.data || []
    } catch (error) {
      console.error('Failed to fetch data submissions:', error)
      throw error
    }
  },

  getDataSubmissionStats: async () => {
    try {
      const response = await fetch('/api/data-submissions/stats')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch data submission stats')
      }

      return data.data
    } catch (error) {
      console.error('Failed to fetch data submission stats:', error)
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

// Real WebSocket implementation
export { availWS } from './websocket'

// Add ChainData interface that is expected by useAvailAPI.ts
export interface ChainData {
  bestNumber: number
  bestHash: string
  finalizedNumber: number
  finalizedHash: string
  peers: number
  isSyncing: boolean
  systemName: string
  systemVersion: string
  chainName: string
  nodeName: string
  nodeVersion: string
  // Additional properties used in components
  tokenPrice?: number
  priceChange?: number
  finalizedBlocks: number
  signedExtrinsics: number
  stakedAmount: string
  bondedAmount: string
  holders: number
  totalAccounts: number
  transfers: number
  inflationRate: number
  circulating: { amount: string; percentage: number }
  staking: { amount: string; percentage: number }
  treasury: { amount: string; percentage: number }
  others: { amount: string; percentage: number }
  totalIssuance: string
}

// Add SearchResult interface that is expected by useAvailAPI.ts
export interface SearchResult {
  blocks: Block[]
  extrinsics: Extrinsic[]
  accounts: Account[]
  validators: Validator[]
}
