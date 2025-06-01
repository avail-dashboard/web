import axios, { AxiosInstance, AxiosResponse } from 'axios'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is required but not set')
}

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

// Response interceptor for error handling and standardized response format
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle the standardized API response format
    if (response.data && typeof response.data === 'object') {
      if (response.data.success === false) {
        throw new Error(response.data.error?.message || 'API request failed')
      }
      // Return the data field for successful responses
      return {
        ...response,
        data: response.data.data,
        meta: response.data.meta
      }
    }
    return response
  },
  error => {
    console.error('API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Types for API responses based on the backend documentation
export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    source: 'rpc' | 'database'
    note?: string
  }
  error?: {
    code: string
    message: string
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    source: 'rpc' | 'database'
  }
}

// Updated interfaces to match backend API documentation
export interface Block {
  number: number
  hash: string
  parent_hash: string
  timestamp: number
  extrinsics: number
  time: string
  state_root: string
  extrinsics_root: string
  author_id: string
  size: number
  weight: number
  spec: number
  finalized: boolean
  extrinsics_count?: number
}

export interface Extrinsic {
  hash: string
  blockNumber: number
  extrinsicIndex: number
  module: string
  call: string
  success: boolean
  timestamp: number
  signer: string
  fee: number
  tip: number
  signature: string
  args: Record<string, unknown>
  events: Event[]
  isSigned: boolean
  isUserTransaction: boolean
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
  balance: number
  nonce: number
  lastUpdated: string
  accountInfo: {
    free: number
    reserved: number
    frozen: number
    flags: number
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
  appId: number
  size: number
  dataHash: string
  submitter: string
  timestamp: number
  success: boolean
}

export interface Validator {
  address: string
  active: boolean
  commission: string
  totalStake: string
  ownStake: string
  nominators: number
  identity?: {
    display?: string
    web?: string
  }
}

export interface ChainStats {
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
  circulating: {
    amount: string
    percentage: number
  }
  staking: {
    amount: string
    percentage: number
  }
  treasury: {
    amount: string
    percentage: number
  }
  others: {
    amount: string
    percentage: number
  }
  marketCap: number
  totalSupply: number
  circulatingSupply: number
  stakingRatio: number
  inflation: number
  activeValidators: number
  blockTime: number
  lastBlockTimestamp: number
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
  }): Promise<Block[]> =>
    api.get('/blocks', { params }).then(res => res.data || []),

  getBlock: (identifier: string): Promise<Block> =>
    api.get(`/blocks/${identifier}`).then(res => res.data),

  getLatestBlocks: (limit = 10): Promise<Block[]> =>
    api
      .get('/blocks', { params: { page: 1, limit } })
      .then(res => res.data || []),
}

// Extrinsics API
export const extrinsicsApi = {
  getExtrinsics: (params?: {
    page?: number
    limit?: number
    block?: number
  }): Promise<Extrinsic[]> =>
    api
      .get('/extrinsics', { params })
      .then(res => res.data || []),

  getExtrinsic: (hash: string): Promise<Extrinsic> =>
    api.get(`/extrinsics/${hash}`).then(res => res.data),

  getLatestExtrinsics: (limit = 10): Promise<Extrinsic[]> =>
    api.get('/extrinsics', { params: { page: 1, limit } }).then(res => res.data || []),
}

// Accounts API
export const accountsApi = {
  getAccount: (address: string): Promise<Account> =>
    api.get(`/accounts/${address}`).then(res => res.data),
}

// Data Submissions API
export const dataSubmissionsApi = {
  getDataSubmissions: (params?: {
    page?: number
    limit?: number
    appId?: number
    submitter?: string
    orderBy?: string
    order?: string
  }): Promise<DataSubmission[]> =>
    api.get('/data-submissions', { params }).then(res => res.data || []),

  getDataSubmissionStats: () =>
    api.get('/data-submissions/stats').then(res => res.data),
}

// Validators API
export const validatorsApi = {
  getValidators: (params?: {
    page?: number
    limit?: number
  }) =>
    api.get('/validators', { params }).then(res => res.data?.validators || []),

  getValidator: (address: string): Promise<Validator> =>
    api.get(`/validators/${address}`).then(res => res.data),

  getStakingOverview: () =>
    api.get('/validators/staking/overview').then(res => res.data),

  getNominationPools: () =>
    api.get('/validators/nomination-pools').then(res => res.data?.data || []),
}

// Chain API
export const chainApi = {
  getChainStats: (): Promise<ChainStats> =>
    api.get('/chain/stats').then(res => res.data),
}

// Analytics API
export const analyticsApi = {
  getNetworkAnalytics: (params?: { period?: string }) =>
    api.get('/analytics/network', { params }).then(res => res.data),

  getGasAnalytics: (params?: { period?: string; granularity?: string }) =>
    api.get('/analytics/gas', { params }).then(res => res.data),

  getRollupAnalytics: (params?: { period?: string }) =>
    api.get('/analytics/rollups', { params }).then(res => res.data),

  getDataThroughputAnalytics: (params?: { period?: string; granularity?: string }) =>
    api.get('/analytics/data-throughput', { params }).then(res => res.data),

  getValidatorAnalytics: () =>
    api.get('/analytics/validators').then(res => res.data),
}

// Rollups API
export const rollupsApi = {
  getRollupLeaderboard: (params?: { period?: string; metric?: string }) =>
    api.get('/rollups/leaderboard', { params }).then(res => res.data),

  getRollups: (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    sortBy?: string
    sortOrder?: string
  }) =>
    api.get('/rollups', { params }).then(res => res.data?.rollups || []),

  getRollup: (appId: number) =>
    api.get(`/rollups/${appId}`).then(res => res.data),

  getRollupSubmissions: (appId: number, params?: { page?: number; limit?: number }) =>
    api.get(`/rollups/${appId}/submissions`, { params }).then(res => res.data?.submissions || []),

  getRollupBlobs: (appId: number, params?: { page?: number; limit?: number }) =>
    api.get(`/rollups/${appId}/blobs`, { params }).then(res => res.data?.blobs || []),

  getRollupAnalytics: (appId: number, params?: { period?: string }) =>
    api.get(`/rollups/${appId}/analytics`, { params }).then(res => res.data),
}

// Search API
export const searchApi = {
  search: (query: string) =>
    api.get(`/search?q=${encodeURIComponent(query)}`).then(res => res.data || []),
}

// Health API
export const healthApi = {
  getHealth: () =>
    api.get('/health').then(res => res.data),
}

// Export the main api instance for custom requests
export default api

// Export the unified API interface that hooks expect
export const availAPI = {
  getChainData: async (): Promise<ChainStats> => {
    try {
      return await chainApi.getChainStats()
    } catch (error) {
      console.error('Failed to fetch chain data:', error)
      throw error
    }
  },

  getLatestBlocks: async (count: number = 10): Promise<Block[]> => {
    try {
      return await blocksApi.getLatestBlocks(count)
    } catch (error) {
      console.error('Failed to fetch latest blocks:', error)
      throw error
    }
  },

  getBlock: async (numberOrHash: string | number): Promise<Block> => {
    try {
      return await blocksApi.getBlock(numberOrHash.toString())
    } catch (error) {
      console.error('Failed to fetch block:', error)
      throw error
    }
  },

  getExtrinsics: async (
    blockNumber?: number,
    page: number = 1,
    limit: number = 10
  ): Promise<Extrinsic[]> => {
    try {
      const params: { block?: number; page?: number; limit?: number } = { page, limit }
      if (blockNumber) {
        params.block = blockNumber
      }
      return await extrinsicsApi.getExtrinsics(params)
    } catch (error) {
      console.error('Failed to fetch extrinsics:', error)
      throw error
    }
  },

  getValidators: async (): Promise<Validator[]> => {
    try {
      return await validatorsApi.getValidators({ page: 1, limit: 100 })
    } catch (error) {
      console.error('Failed to fetch validators:', error)
      throw error
    }
  },

  getAccount: async (address: string): Promise<Account> => {
    try {
      return await accountsApi.getAccount(address)
    } catch (error) {
      console.error('Failed to fetch account:', error)
      throw error
    }
  },

  search: async (query: string) => {
    try {
      return await searchApi.search(query)
    } catch (error) {
      console.error('Failed to search:', error)
      throw error
    }
  },

  getAnalytics: async () => {
    try {
      return await analyticsApi.getNetworkAnalytics()
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      throw error
    }
  },

  getDataSubmissions: async (
    page: number = 1,
    limit: number = 20,
    appId?: number,
    submitter?: string
  ): Promise<DataSubmission[]> => {
    try {
      return await dataSubmissionsApi.getDataSubmissions({
        page,
        limit,
        appId,
        submitter
      })
    } catch (error) {
      console.error('Failed to fetch data submissions:', error)
      throw error
    }
  },

  getDataSubmissionStats: async () => {
    try {
      return await dataSubmissionsApi.getDataSubmissionStats()
    } catch (error) {
      console.error('Failed to fetch data submission stats:', error)
      throw error
    }
  },

  refreshBackendStatus: async (): Promise<boolean> => {
    try {
      await healthApi.getHealth()
      return true
    } catch {
      return false
    }
  },
}

// Real WebSocket implementation
export { availWS } from './websocket'

// Legacy interfaces for backward compatibility
export type ChainData = ChainStats

export interface SearchResult {
  blocks: Block[]
  extrinsics: Extrinsic[]
  accounts: Account[]
  validators: Validator[]
}
