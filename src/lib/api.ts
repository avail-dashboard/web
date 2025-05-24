import axios from 'axios'

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

// ==== OPTION 1: SUBSCAN API ====
class SubscanAPI {
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
      // Get basic stats
      const statsResponse = await axios.post(`${this.baseURL}/api/scan/metadata`, {}, { headers: this.headers })
      const stats = statsResponse.data.data

      return {
        finalizedBlocks: stats?.blockNum || 0,
        signedExtrinsics: stats?.extrinsicsCount || 0,
        totalAccounts: stats?.accountsCount || 0,
        transfers: stats?.transfersCount || 0
      }
    } catch (error) {
      console.error('Subscan chain data error:', error)
      return {}
    }
  }

  async getTokenPrice(): Promise<{ price: number; change: number }> {
    try {
      // You can integrate with CoinGecko/CoinMarketCap here
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=avail&vs_currencies=usd&include_24hr_change=true')
      const data = response.data.avail
      
      return {
        price: data?.usd || 0,
        change: data?.usd_24h_change || 0
      }
    } catch (error) {
      console.error('Token price error:', error)
      return { price: 0, change: 0 }
    }
  }
}

// ==== OPTION 2: DIRECT RPC ====
class AvailRPC {
  private endpoint = process.env.AVAIL_RPC_ENDPOINT || 'wss://mainnet-rpc.avail.so/ws'
  private api: any = null

  private async getAPI() {
    if (!this.api) {
      try {
        // Dynamic import to avoid SSR issues
        const { ApiPromise, WsProvider } = await import('@polkadot/api')
        const provider = new WsProvider(this.endpoint)
        this.api = await ApiPromise.create({ provider })
        console.log('RPC: Connected to', this.endpoint)
      } catch (error) {
        console.error('RPC connection error:', error)
        throw error
      }
    }
    return this.api
  }

  async getLatestBlocks(count = 10): Promise<Block[]> {
    try {
      const api = await this.getAPI()
      
      // Get the latest block header
      const latestHeader = await api.rpc.chain.getHeader()
      const latestBlockNumber = latestHeader.number.toNumber()
      
      // Fetch the last 'count' blocks
      const blocks: Block[] = []
      for (let i = 0; i < count && (latestBlockNumber - i) > 0; i++) {
        const blockNumber = latestBlockNumber - i
        const blockHash = await api.rpc.chain.getBlockHash(blockNumber)
        const block = await api.rpc.chain.getBlock(blockHash)
        const header = block.block.header
        
        blocks.push({
          number: blockNumber,
          hash: blockHash.toString(),
          time: Date.now() - (i * 6000), // Estimate: ~6 seconds per block
          extrinsics: block.block.extrinsics.length,
          parentHash: header.parentHash.toString(),
          stateRoot: header.stateRoot.toString()
        })
      }
      
      return blocks
    } catch (error) {
      console.error('RPC error:', error)
      return []
    }
  }

  async getChainStats(): Promise<Partial<ChainData>> {
    try {
      const api = await this.getAPI()
      
      // Get latest block number
      const latestHeader = await api.rpc.chain.getHeader()
      const finalizedBlocks = latestHeader.number.toNumber()
      
      // Get total issuance
      const totalIssuance = await api.query.balances.totalIssuance()
      
      // Note: Some data like extrinsics count would require indexing
      // For now, we'll return basic data available from RPC
      return {
        finalizedBlocks,
        totalIssuance: totalIssuance.toString()
      }
    } catch (error) {
      console.error('RPC chain stats error:', error)
      return {}
    }
  }

  async disconnect() {
    if (this.api) {
      await this.api.disconnect()
      this.api = null
    }
  }
}

// ==== OPTION 3: SUBQUERY GRAPHQL ====
class SubQueryAPI {
  private endpoint = 'https://your-subquery-endpoint.com/graphql'

  async getBlocks(limit = 10): Promise<Block[]> {
    try {
      const query = `
        query GetBlocks($limit: Int!) {
          blocks(first: $limit, orderBy: TIMESTAMP_DESC) {
            nodes {
              number
              hash
              parentHash
              timestamp
              extrinsics {
                totalCount
              }
            }
          }
        }
      `

      const response = await axios.post(this.endpoint, {
        query,
        variables: { limit }
      })

      return response.data.data?.blocks?.nodes?.map((block: any) => ({
        number: block.number,
        hash: block.hash,
        time: new Date(block.timestamp).getTime(),
        extrinsics: block.extrinsics?.totalCount || 0,
        parentHash: block.parentHash
      })) || []
    } catch (error) {
      console.error('SubQuery error:', error)
      return []
    }
  }

  async getChainData(): Promise<Partial<ChainData>> {
    try {
      const query = `
        query GetChainStats {
          blocks(first: 1, orderBy: NUMBER_DESC) {
            totalCount
          }
          extrinsics {
            totalCount
          }
          accounts {
            totalCount
          }
        }
      `

      const response = await axios.post(this.endpoint, { query })
      const data = response.data.data

      return {
        finalizedBlocks: data?.blocks?.totalCount || 0,
        signedExtrinsics: data?.extrinsics?.totalCount || 0,
        totalAccounts: data?.accounts?.totalCount || 0
      }
    } catch (error) {
      console.error('SubQuery chain data error:', error)
      return {}
    }
  }
}

// ==== UNIFIED API CLIENT ====
export class AvailAPI {
  private subscan: SubscanAPI
  private rpc: AvailRPC
  private subquery: SubQueryAPI
  private preferredSource: 'subscan' | 'rpc' | 'subquery' = 'subscan'

  constructor(preferredSource: 'subscan' | 'rpc' | 'subquery' = 'subscan') {
    this.subscan = new SubscanAPI()
    this.rpc = new AvailRPC()
    this.subquery = new SubQueryAPI()
    this.preferredSource = preferredSource
  }

  async getLatestBlocks(count = 10): Promise<Block[]> {
    switch (this.preferredSource) {
      case 'subscan':
        return this.subscan.getBlocks(0, count)
      case 'subquery':
        return this.subquery.getBlocks(count)
      case 'rpc':
        return this.rpc.getLatestBlocks(count)
      default:
        return this.subscan.getBlocks(0, count)
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
      // Try to get real data from preferred source
      let realData: Partial<ChainData> = {}
      
      switch (this.preferredSource) {
        case 'subscan':
          realData = await this.subscan.getChainData()
          break
        case 'subquery':
          realData = await this.subquery.getChainData()
          break
        case 'rpc':
          realData = await this.rpc.getChainStats()
          break
      }

      // Get token price
      const priceData = await this.subscan.getTokenPrice()

      // Merge real data with mock data as fallback
      return {
        ...mockData,
        ...realData,
        tokenPrice: priceData.price || mockData.tokenPrice,
        priceChange: priceData.change || mockData.priceChange
      }
    } catch (error) {
      console.error('API error, falling back to mock data:', error)
      return mockData
    }
  }

  // Switch data source dynamically
  setDataSource(source: 'subscan' | 'rpc' | 'subquery') {
    this.preferredSource = source
  }
}

// Export singleton instance
export const availAPI = new AvailAPI('subscan') 