'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'

interface SearchResult {
  type: 'block' | 'transaction' | 'account'
  id: string
  data: any
}

interface SearchComponentProps {
  onSearch?: (query: string, results: SearchResult[]) => void
}

export function SearchComponent({ onSearch }: SearchComponentProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const detectSearchType = (
    input: string
  ): 'block' | 'transaction' | 'account' | 'unknown' => {
    // Remove whitespace
    const clean = input.trim()

    // Block number (numeric)
    if (/^\d+$/.test(clean)) {
      return 'block'
    }

    // Hash (0x + 64 hex chars)
    if (/^0x[a-fA-F0-9]{64}$/.test(clean)) {
      return 'transaction'
    }

    // Block hash or transaction hash
    if (/^0x[a-fA-F0-9]{32,64}$/.test(clean)) {
      return 'block'
    }

    // Account address (various substrate formats)
    if (clean.length >= 47 && clean.length <= 49) {
      return 'account'
    }

    return 'unknown'
  }

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)
    setResults([])

    try {
      const searchType = detectSearchType(searchQuery)
      const searchResults: SearchResult[] = []

      switch (searchType) {
        case 'block':
          // Search for block by number or hash
          if (/^\d+$/.test(searchQuery)) {
            // Block by number
            searchResults.push({
              type: 'block',
              id: searchQuery,
              data: {
                number: parseInt(searchQuery),
                hash: '0x' + 'a'.repeat(64), // Mock hash
                timestamp: Date.now() - Math.random() * 86400000,
                extrinsics: Math.floor(Math.random() * 10),
              },
            })
          } else {
            // Block by hash
            searchResults.push({
              type: 'block',
              id: searchQuery,
              data: {
                number: Math.floor(Math.random() * 1000000),
                hash: searchQuery,
                timestamp: Date.now() - Math.random() * 86400000,
                extrinsics: Math.floor(Math.random() * 10),
              },
            })
          }
          break

        case 'transaction':
          // Search for transaction by hash
          searchResults.push({
            type: 'transaction',
            id: searchQuery,
            data: {
              hash: searchQuery,
              blockNumber: Math.floor(Math.random() * 1000000),
              success: Math.random() > 0.1,
              timestamp: Date.now() - Math.random() * 86400000,
              from: '5' + 'A'.repeat(47),
              to: '5' + 'B'.repeat(47),
              value: (Math.random() * 1000).toFixed(4),
            },
          })
          break

        case 'account':
          // Search for account by address
          searchResults.push({
            type: 'account',
            id: searchQuery,
            data: {
              address: searchQuery,
              balance: (Math.random() * 10000).toFixed(4),
              nonce: Math.floor(Math.random() * 100),
              transactions: Math.floor(Math.random() * 500),
            },
          })
          break

        default:
          setError(`Unrecognized search format: ${searchQuery}`)
          return
      }

      setResults(searchResults)
      onSearch?.(searchQuery, searchResults)
    } catch (err) {
      console.error('Search error:', err)
      setError('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(query)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search blocks, transactions, or accounts..."
            className="w-full pl-10 pr-12 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-avail-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-avail-600 text-white px-3 py-1 rounded text-sm hover:bg-avail-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {/* Search Tips */}
      <div className="mt-2 text-xs text-muted-foreground">
        <span>Try: </span>
        <button
          onClick={() => setQuery('1000000')}
          className="text-avail-600 hover:underline"
        >
          Block #1000000
        </button>
        <span> • </span>
        <button
          onClick={() => setQuery('0x' + 'a'.repeat(64))}
          className="text-avail-600 hover:underline"
        >
          Transaction hash
        </button>
        <span> • </span>
        <button
          onClick={() => setQuery('5' + 'C'.repeat(47))}
          className="text-avail-600 hover:underline"
        >
          Account address
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Results Display */}
      {results.length > 0 && (
        <div className="mt-4 space-y-3">
          <h3 className="font-semibold text-lg">Search Results</h3>
          {results.map((result, index) => (
            <div key={index} className="p-4 bg-card border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-avail-100 text-avail-800">
                  {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                </span>
              </div>

              {result.type === 'block' && (
                <div>
                  <div className="font-semibold">
                    Block #{result.data.number.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {result.data.hash}
                  </div>
                  <div className="text-sm mt-1">
                    <span>Time: {formatTime(result.data.timestamp)}</span>
                    <span className="ml-4">
                      Extrinsics: {result.data.extrinsics}
                    </span>
                  </div>
                </div>
              )}

              {result.type === 'transaction' && (
                <div>
                  <div className="font-semibold text-sm font-mono">
                    {result.data.hash}
                  </div>
                  <div className="text-sm mt-1">
                    <span>
                      Block: #{result.data.blockNumber.toLocaleString()}
                    </span>
                    <span className="ml-4">Status: </span>
                    <span
                      className={
                        result.data.success ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {result.data.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <div className="text-sm mt-1">
                    <span>Value: {result.data.value} AVAIL</span>
                    <span className="ml-4">
                      Time: {formatTime(result.data.timestamp)}
                    </span>
                  </div>
                </div>
              )}

              {result.type === 'account' && (
                <div>
                  <div className="font-semibold text-sm font-mono">
                    {formatAddress(result.data.address)}
                  </div>
                  <div className="text-sm mt-1">
                    <span>Balance: {result.data.balance} AVAIL</span>
                    <span className="ml-4">Nonce: {result.data.nonce}</span>
                  </div>
                  <div className="text-sm mt-1">
                    <span>Transactions: {result.data.transactions}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
