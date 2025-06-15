import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { API_BASE_URL } from './env'

// API Configuration - No fallbacks, env validation ensures this exists

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

      // Debug logging for blocks data
      if (response.config.url?.includes('/blocks') && response.data.data) {
        console.log('Blocks API Response:', {
          url: response.config.url,
          dataLength: Array.isArray(response.data.data)
            ? response.data.data.length
            : 'not array',
          firstBlock:
            Array.isArray(response.data.data) && response.data.data.length > 0
              ? {
                  number: response.data.data[0].number,
                  hash: response.data.data[0].hash,
                  hashType: typeof response.data.data[0].hash,
                  hashLength: response.data.data[0].hash?.length,
                  parentHash: response.data.data[0].parentHash,
                  parentHashType: typeof response.data.data[0].parentHash,
                  validator: response.data.data[0].validator,
                  extrinsicsCount: response.data.data[0].extrinsicsCount,
                }
              : 'no blocks',
        })
      }

      // Return the data field for successful responses
      return {
        ...response,
        data: response.data.data,
        meta: response.data.meta,
      }
    }
    return response
  },
  error => {
    console.error('API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// ============================================================================
// TYPE DEFINITIONS - Updated to match API Documentation exactly
// ============================================================================

// Common Response Format
export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    source?: string
    [key: string]: unknown
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

// ============================================================================
// BLOCKS API TYPES
// ============================================================================

export interface Block {
  number: number
  hash?: string
  parentHash: string
  stateRoot: string
  timestamp: string
  extrinsicsCount: number
  createdAt?: string
  extrinsics?: number
  time?: string
  extrinsics_root?: string
  validator?: string
  size?: number
  weight?: string
  spec?: number
  finalized?: boolean
  eventsCount?: number
}

export interface BlockDetails {
  number: number
  hash?: string
  parentHash: string
  timestamp: number
  extrinsicsCount: number
  time: string
  state_root: string
  extrinsics_root: string
  validator: string
  size: number
  weight: string
  spec: number
  finalized: boolean
  extrinsics: Extrinsic[]
  eventsCount?: number
}

// ============================================================================
// EXTRINSICS API TYPES
// ============================================================================

export interface Extrinsic {
  id?: string
  hash?: string
  blockNumber?: number
  extrinsicIndex?: number
  extrinsicHash?: string
  method?: string
  section?: string
  call?: string
  module?: string
  signer?: string
  nonce?: number
  signature?: string
  tip?: number | string
  success?: boolean
  timestamp: number
  fee?: number | string
  args?: Record<string, unknown>
  events?: Event[]
  // Legacy fields for backward compatibility
  isSigned?: boolean
  isUserTransaction?: boolean
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

// ============================================================================
// ACCOUNTS API TYPES
// ============================================================================

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

// ============================================================================
// TRANSFERS API TYPES
// ============================================================================

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

// ============================================================================
// DATA SUBMISSIONS API TYPES
// ============================================================================

export interface DataSubmission {
  blockNumber: number
  extrinsicIndex: number
  extrinsicHash: string
  appId: number
  submitter: string
  dataSize: number
  dataHash: string
  kateCommitment?: string
  timestamp: string
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

// ============================================================================
// VALIDATORS & STAKING API TYPES
// ============================================================================

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

export interface ValidatorDetails extends Validator {
  stash_address?: string
  controller_address?: string
  nominator_count?: number
  nominator_list?: string[]
  commission_rate?: number
  session_keys?: string[]
  bonded_amounts?: {
    own: string
    total: string
  }
  rewards_history?: RewardEntry[]
  proposed_blocks?: number[]
  slashing_events?: SlashingEvent[]
}

export interface RewardEntry {
  era: number
  amount: string
  timestamp: number
}

export interface SlashingEvent {
  era: number
  amount: string
  reason: string
  timestamp: number
}

export interface StakingOverview {
  total_staked: string
  total_validators: number
  active_validators: number
  waiting_validators: number
  min_stake_required: string
  max_nominators_per_validator: number
  current_era: number
  session_length: number
  era_length: number
}

// ============================================================================
// ROLLUPS & APP SPACES API TYPES
// ============================================================================

export interface Rollup {
  app_id: number
  name: string
  description: string
  last_active: string
  total_submissions: number
  total_data_size: number
  total_fees_paid: string
  paid_per_mb: string
  website?: string
  logo_url?: string
}

export interface RollupDetails extends Rollup {
  first_seen: string
  statistics: {
    submissions_24h: number
    data_size_24h: number
    fees_paid_24h: string
    unique_submitters: number
    average_submission_size: number
  }
  recent_submissions: DataSubmission[]
}

export interface RollupLeaderboard {
  leaderboard: RollupLeaderboardEntry[]
  total_rollups: number
  metric: string
}

export interface RollupLeaderboardEntry {
  rank: number
  app_id: number
  name: string
  metric_value: number
  percentage_of_total: number
  change_24h: number
}

export interface RollupsListResponse {
  rollups: Rollup[]
  total_count: number
  active_count: number
  page: number
  limit: number
}

// ============================================================================
// ANALYTICS API TYPES
// ============================================================================

export interface NetworkAnalytics {
  current_stats: {
    block_height: string
    total_extrinsics: number
    total_data_size: number
    total_fees: number
    active_validators: number
    total_staked: string
    inflation_rate: number
    network_utilization: number
    average_block_time: number
  }
  historical_data: HistoricalDataPoint[]
  gas_price_trend: GasPricePoint[]
  rollup_distribution: RollupDistributionPoint[]
  data_throughput: {
    submissions_24h: number
    data_size_24h: number
    unique_apps_24h: number
    average_submission_size: number
  }
}

export interface HistoricalDataPoint {
  timestamp: number
  block_height: number
  total_extrinsics: number
  total_data_size: number
  active_validators: number
  network_utilization: number
}

export interface GasPricePoint {
  timestamp: number
  average_gas_price: string
  median_gas_price: string
  gas_used: number
  gas_limit: number
}

export interface RollupDistributionPoint {
  app_id: number
  name: string
  percentage: number
  data_size: number
}

export interface GasAnalytics {
  current_gas_price: string
  average_gas_price_24h: string
  gas_price_trend: GasPricePoint[]
  gas_efficiency: {
    average_gas_used: number
    average_gas_limit: number
    efficiency_ratio: number
  }
  cost_per_transaction: {
    average_cost_24h: string
    median_cost_24h: string
    cost_trend: CostTrendPoint[]
  }
  cost_per_block: {
    average_cost_24h: string
    cost_trend: CostTrendPoint[]
  }
  fee_distribution: {
    by_transaction_type: FeeDistributionPoint[]
    by_complexity: FeeDistributionPoint[]
  }
}

export interface CostTrendPoint {
  timestamp: number
  average_cost: string
  median_cost: string
  transaction_count: number
}

export interface FeeDistributionPoint {
  category: string
  percentage: number
  total_fees: string
  transaction_count: number
}

// ============================================================================
// WEBSOCKET SUBSCRIPTION TYPES
// ============================================================================

export interface WebSocketSubscription {
  type: 'subscribe' | 'unsubscribe'
  channel: string
  params?: Record<string, unknown>
}

export interface WebSocketMessage<T = unknown> {
  type: string
  channel: string
  data: T
  timestamp: number
}

export interface BlockUpdate {
  block: Block
  new_extrinsics: Extrinsic[]
}

export interface ValidatorUpdate {
  validator: Validator
  status_change?: 'active' | 'inactive' | 'slashed'
  stake_change?: {
    previous: string
    current: string
  }
}

export interface RollupUpdate {
  app_id: number
  new_submissions: DataSubmission[]
  updated_stats: {
    total_submissions: number
    total_data_size: number
    submissions_24h: number
  }
}

// ============================================================================
// SEARCH API TYPES
// ============================================================================

export interface SearchResult {
  blocks: Block[]
  extrinsics: Extrinsic[]
  accounts: Account[]
  validators: Validator[]
  rollups?: Rollup[]
}

// ============================================================================
// LEGACY TYPES FOR BACKWARD COMPATIBILITY
// ============================================================================

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

// ============================================================================
// API FUNCTIONS
// ============================================================================

// Blocks API
export const blocksApi = {
  getBlocks: (params?: { page?: number; limit?: number }): Promise<Block[]> =>
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
    api.get('/extrinsics', { params }).then(res => res.data || []),

  getExtrinsic: (hash: string): Promise<Extrinsic> =>
    api.get(`/extrinsics/${hash}`).then(res => res.data),

  getLatestExtrinsics: (limit = 10): Promise<Extrinsic[]> =>
    api
      .get('/extrinsics', { params: { page: 1, limit } })
      .then(res => res.data || []),
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

  getDataSubmissionStats: (): Promise<DataSubmissionStats> =>
    api.get('/data-submissions/stats').then(res => res.data),
}

// Validators API
export const validatorsApi = {
  getValidators: (params?: { page?: number; limit?: number }) =>
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

  getDataThroughputAnalytics: (params?: {
    period?: string
    granularity?: string
  }) => api.get('/analytics/data-throughput', { params }).then(res => res.data),

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
  }) => api.get('/rollups', { params }).then(res => res.data?.rollups || []),

  getRollup: (appId: number) =>
    api.get(`/rollups/${appId}`).then(res => res.data),

  getRollupSubmissions: (
    appId: number,
    params?: { page?: number; limit?: number }
  ) =>
    api
      .get(`/rollups/${appId}/submissions`, { params })
      .then(res => res.data?.submissions || []),

  getRollupBlobs: (appId: number, params?: { page?: number; limit?: number }) =>
    api
      .get(`/rollups/${appId}/blobs`, { params })
      .then(res => res.data?.blobs || []),

  getRollupAnalytics: (appId: number, params?: { period?: string }) =>
    api.get(`/rollups/${appId}/analytics`, { params }).then(res => res.data),
}

// Search API
export const searchApi = {
  search: (query: string) =>
    api
      .get(`/search?q=${encodeURIComponent(query)}`)
      .then(res => res.data || []),
}

// Health API
export const healthApi = {
  getHealth: () => fetch('/api/health').then(res => res.json()),
}

// Export the main api instance for custom requests
export default api

// Request deduplication and caching layer
interface CacheEntry<T> {
  data: T
  timestamp: number
  promise?: Promise<T>
}

class RequestDeduplicator {
  private cache = new Map<string, CacheEntry<any>>()
  private pendingRequests = new Map<string, Promise<any>>()
  
  // Default cache TTL: 10 seconds for most requests
  private defaultTTL = 10 * 1000 
  
  // Custom TTLs for different types of data
  private customTTLs = {
    'chain-data': 30 * 1000, // 30s for chain stats
    'blocks-latest': 10 * 1000, // 10s for latest blocks
    'block-detail': 60 * 1000, // 60s for individual blocks
    'validators': 5 * 60 * 1000, // 5min for validators
  }
  
  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    const paramStr = params ? JSON.stringify(params) : ''
    return `${endpoint}:${paramStr}`
  }
  
  private getTTL(cacheType: string): number {
    return this.customTTLs[cacheType as keyof typeof this.customTTLs] || this.defaultTTL
  }
  
  private isStale(entry: CacheEntry<any>, ttl: number): boolean {
    return Date.now() - entry.timestamp > ttl
  }
  
  async deduplicate<T>(
    cacheKey: string,
    cacheType: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const ttl = this.getTTL(cacheType)
    const existing = this.cache.get(cacheKey)
    
    // Return cached data if not stale
    if (existing && !this.isStale(existing, ttl)) {
      return existing.data
    }
    
    // Return pending request if already in flight
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)
    }
    
    // Make new request
    const promise = requestFn()
    this.pendingRequests.set(cacheKey, promise)
    
    try {
      const data = await promise
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      })
      
      return data
    } catch (error) {
      // Don't cache errors, but remove from pending
      this.pendingRequests.delete(cacheKey)
      throw error
    } finally {
      // Always remove from pending requests
      this.pendingRequests.delete(cacheKey)
    }
  }
  
  // Method to clear cache (useful for manual refresh)
  clearCache(pattern?: string) {
    if (pattern) {
      const keys = Array.from(this.cache.keys())
      for (const key of keys) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }
  
  // Method to get cache stats (for debugging)
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      cacheKeys: Array.from(this.cache.keys()),
    }
  }
}

// Create a singleton deduplicator instance
const requestDeduplicator = new RequestDeduplicator()

// Export the unified API interface that hooks expect
export const availAPI = {
  getChainData: async (): Promise<ChainStats> => {
    return requestDeduplicator.deduplicate(
      'chain-data',
      'chain-data',
      async () => {
        const response = await fetch('/api/chain')
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch chain data')
        }
        return data
      }
    )
  },

  getLatestBlocks: async (count: number = 10): Promise<Block[]> => {
    return requestDeduplicator.deduplicate(
      `blocks-latest:${count}`,
      'blocks-latest',
      async () => {
        const response = await fetch(`/api/blocks?limit=${count}`)
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch latest blocks')
        }
        return data.data || data
      }
    )
  },

  getBlock: async (numberOrHash: string | number): Promise<Block> => {
    return requestDeduplicator.deduplicate(
      `block:${numberOrHash}`,
      'block-detail',
      async () => {
        const response = await fetch(`/api/blocks/${numberOrHash}`)
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch block')
        }
        return data.data || data
      }
    )
  },

  getExtrinsics: async (
    blockNumber?: number,
    page: number = 1,
    limit: number = 10
  ): Promise<Extrinsic[]> => {
    const cacheKey = `extrinsics:${JSON.stringify({ blockNumber, page, limit })}`
    return requestDeduplicator.deduplicate(
      cacheKey,
      'default',
      async () => {
        const params = new URLSearchParams()
        if (blockNumber) params.append('block', blockNumber.toString())
        if (page) params.append('page', page.toString())
        if (limit) params.append('limit', limit.toString())

        const response = await fetch(`/api/extrinsics?${params}`)
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch extrinsics')
        }
        return data.data || data
      }
    )
  },

  getBlockExtrinsics: async (blockNumber: number): Promise<Extrinsic[]> => {
    const cacheKey = `block-extrinsics:${blockNumber}`
    return requestDeduplicator.deduplicate(
      cacheKey,
      'block-detail',
      async () => {
        const response = await fetch(`/api/extrinsics/block/${blockNumber}`)
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch block extrinsics')
        }
        return data.data || []
      }
    )
  },

  getValidators: async (): Promise<Validator[]> => {
    return requestDeduplicator.deduplicate(
      'validators',
      'validators',
      async () => {
        const response = await fetch('/api/validators?page=1&limit=100')
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch validators')
        }
        return data.data || data
      }
    )
  },

  getAccount: async (address: string): Promise<Account> => {
    try {
      const response = await fetch(`/api/accounts/${address}`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch account')
      }
      return data.data || data
    } catch (error) {
      console.error('Failed to fetch account:', error)
      throw error
    }
  },

  search: async (query: string) => {
    return requestDeduplicator.deduplicate(
      `search:${query}`,
      'default',
      async () => {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to search')
        }
        return data.data || data
      }
    )
  },

  getAnalytics: async () => {
    try {
      const response = await fetch('/api/analytics/network')
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics')
      }
      return data.data || data
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
  ): Promise<{dataSubmissions: DataSubmission[], totalCount: number}> => {
    try {
      const params = new URLSearchParams({
        page: (page - 1).toString(), // Convert to 0-based for Next.js API
        limit: limit.toString(),
      })
      if (appId) params.append('appId', appId.toString())
      if (submitter) params.append('submitter', submitter)

      const response = await fetch(`/api/data-submissions?${params}`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch data submissions')
      }
      // Transform backend response to match frontend expectations
      // Backend returns: { data: [...], pagination: { totalCount: ... } }
      // Frontend expects: { dataSubmissions: [...], totalCount: ... }
      return {
        dataSubmissions: data.data || [],
        totalCount: data.pagination?.totalCount || data.meta?.total || 0
      }
    } catch (error) {
      console.error('Failed to fetch data submissions:', error)
      throw error
    }
  },

  getDataSubmissionStats: async (): Promise<DataSubmissionStats> => {
    try {
      const response = await fetch('/api/data-submissions/stats')
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch data submission stats')
      }
      // Extract from nested API response structure
      return data.data || {
        totalSubmissions: 0,
        totalDataSize: 0,
        uniqueApps: 0,
        uniqueSubmitters: 0,
        averageSize: 0,
        submissionsToday: 0,
        dataSizeToday: 0
      }
    } catch (error) {
      console.error('Failed to fetch data submission stats:', error)
      throw error
    }
  },

  refreshBackendStatus: async (): Promise<boolean> => {
    try {
      const healthData = await healthApi.getHealth()
      return healthData.backend?.available === true
    } catch {
      return false
    }
  },

  // Cache management methods
  clearCache: (pattern?: string) => {
    requestDeduplicator.clearCache(pattern)
  },

  getCacheStats: () => {
    return requestDeduplicator.getCacheStats()
  },
}

// Real WebSocket implementation
export { availWS } from './websocket'

// Legacy interfaces for backward compatibility
export type ChainData = ChainStats
