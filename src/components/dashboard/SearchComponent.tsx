'use client'

import React, { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { searchApi } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface SearchResult {
  type: 'block' | 'extrinsic' | 'rollup' | 'data_submission'
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
  ): 'block' | 'extrinsic' | 'rollup' | 'data_submission' | 'unknown' => {
    const trimmed = input.trim()

    // Block number (numeric)
    if (/^\d+$/.test(trimmed)) {
      return 'block'
    }

    // Hash (0x followed by 64 hex characters) - could be block, extrinsic, or data submission
    if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
      return 'extrinsic' // Let API determine the actual type
    }

    // Account address (47+ characters, Substrate format)
    if (trimmed.length >= 47 && /^[a-zA-Z0-9]+$/.test(trimmed)) {
      return 'extrinsic' // Search for extrinsics by signer
    }

    // Text search - likely rollup name
    return 'rollup'
  }

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)
    setResults([])

    try {
      const searchType = detectSearchType(searchQuery)

      // Use the search API instead of direct navigation
      try {
        const searchResults = await searchApi.search(searchQuery)
        console.log('Frontend received search results:', searchResults)
        
        if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
          setError('No results found for your search query.')
          return
        }

        // If single result, navigate directly
        if (searchResults.results.length === 1) {
          const result = searchResults.results[0]
          switch (result.type) {
            case 'block':
              router.push(`/blocks/${result.id}`)
              break
            case 'extrinsic':
              router.push(`/extrinsics/${result.data.hash || result.id}`)
              break
            case 'rollup':
              router.push(`/rollups/${result.id}`)
              break
            case 'data_submission':
              router.push(`/data-submissions/${result.id}`)
              break
          }
        } else {
          // Multiple results - set them for display
          setResults(searchResults.results.map(r => ({
            type: r.type,
            id: r.id,
            data: r.data
          })))
        }
      } catch (apiError) {
        console.error('Search API error:', apiError)
        // Fallback to direct navigation based on detected type
        switch (searchType) {
          case 'block':
            router.push(`/blocks/${searchQuery.trim()}`)
            break
          case 'extrinsic':
            router.push(`/extrinsics/${searchQuery.trim()}`)
            break
          case 'rollup':
            setError('Rollup search requires API connection.')
            return
          case 'data_submission':
            router.push(`/data-submissions/${searchQuery.trim()}`)
            break
        }
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
            placeholder="Search blocks, extrinsics, rollups, or data submissions..."
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
