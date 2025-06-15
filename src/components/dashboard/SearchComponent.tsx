'use client'

import React, { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { availAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface SearchResult {
  type: 'block' | 'transaction' | 'account'
  id: string
  data: Record<string, unknown>
}

interface SearchComponentProps {
  onSearch?: (query: string, results: SearchResult[]) => void
}

export function SearchComponent({ onSearch }: SearchComponentProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const detectSearchType = (
    input: string
  ): 'block' | 'transaction' | 'account' | 'unknown' => {
    const trimmed = input.trim()

    // Block number (numeric)
    if (/^\d+$/.test(trimmed)) {
      return 'block'
    }

    // Transaction hash or block hash (0x followed by hex)
    if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
      return 'transaction'
    }

    // Account address (starts with 5 and is 48 characters)
    if (/^5[a-zA-Z0-9]{47}$/.test(trimmed)) {
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

      if (searchType === 'unknown') {
        setError(
          'Invalid search format. Please enter a valid block number, transaction hash, or account address.'
        )
        return
      }

      // Navigate directly to the appropriate page based on search type
      switch (searchType) {
        case 'block':
          router.push(`/blocks/${searchQuery.trim()}`)
          break
        case 'transaction':
          router.push(`/extrinsics/${searchQuery.trim()}`)
          break
        case 'account':
          router.push(`/accounts/${searchQuery.trim()}`)
          break
      }

      // Clear the search input
      setQuery('')
      
      onSearch?.(searchQuery, [])
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
              {/* Search results would be rendered here when API is integrated */}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
