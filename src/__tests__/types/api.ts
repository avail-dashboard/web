// API Response Types for Testing

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta: {
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

export interface Block {
  number: number
  hash: string
  parentHash: string
  timestamp: number
  extrinsics: number
  time: string
  stateRoot: string
  extrinsicsRoot: string
  authorId: string
  size: number
  weight: number
  spec: number
  finalized: boolean
}

export interface BlockWithExtrinsics extends Omit<Block, 'extrinsics'> {
  extrinsicsCount: number
  extrinsics: Extrinsic[]
}

export interface Extrinsic {
  id?: string
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
  action: string
  type: string
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

export interface SearchResult {
  type: 'block' | 'extrinsic' | 'account'
  id: string
  title: string
  description: string
  url: string
}

export interface HealthStatus {
  status: string
  timestamp: string
  uptime?: number
  frontend?: {
    status: string
    timestamp: string
    version: string
  }
  backend?: {
    status: string
    available: boolean
    url: string
    error: string | null
  }
  services?: {
    websocket: boolean
    caching: boolean
    database: boolean
  }
  chain?: string
  blockHeight?: number
  peers?: number
  isSyncing?: boolean
}
