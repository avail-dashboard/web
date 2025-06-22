'use client'

import * as React from 'react'
import { Search, Loader2, Hash, Blocks, Database, Package } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
import { searchApi, SearchResult } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

// Use SearchResult from API but extend with score for fuzzy search
interface ExtendedSearchResult extends SearchResult {
  score?: number
}

interface GlobalSearchProps {
  className?: string
  placeholder?: string
  showShortcut?: boolean
}

export function GlobalSearch({
  className,
  placeholder = 'Search blocks, extrinsics, rollups, data submissions...',
  showShortcut = true,
}: GlobalSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const router = useRouter()

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = React.useState('')

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Search API call
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchApi.search(debouncedQuery),
    enabled: debouncedQuery.length > 2,
    staleTime: 30000,
  })

  // Process and score results
  const allResults = React.useMemo(() => {
    if (!searchResults?.results) return []

    const results: ExtendedSearchResult[] = searchResults.results

    // Fuse.js could be used for better fuzzy search scoring if needed in the future

    // For exact API matches, don't re-score since API already did the matching
    if (results.length > 0) {
      return results.slice(0, 10)
    }

    return []
  }, [searchResults, debouncedQuery])

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) {
        // Open search with Cmd+K or Ctrl+K
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault()
          setOpen(true)
        }
        return
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev =>
            prev < allResults.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : allResults.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (allResults[selectedIndex]) {
            handleResultClick(allResults[selectedIndex])
          }
          break
        case 'Escape':
          setOpen(false)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, allResults, selectedIndex])

  // Reset selection when results change
  React.useEffect(() => {
    setSelectedIndex(0)
  }, [allResults])

  const handleResultClick = (result: ExtendedSearchResult) => {
    setOpen(false)
    setQuery('')

    switch (result.type) {
      case 'block': {
        router.push(`/blocks/${result.id}`)
        break
      }
      case 'extrinsic': {
        router.push(`/extrinsics/${result.data.hash || result.id}`)
        break
      }
      case 'rollup': {
        // Redirect to data-submissions with app filter since rollups are disabled
        router.push(`/data-submissions?app=${result.id}`)
        break
      }
      case 'data_submission': {
        router.push(`/data-submissions/${result.id}`)
        break
      }
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'block':
        return <Blocks className="h-4 w-4" />
      case 'extrinsic':
        return <Hash className="h-4 w-4" />
      case 'rollup':
        return <Package className="h-4 w-4" />
      case 'data_submission':
        return <Database className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getResultTitle = (result: ExtendedSearchResult) => {
    switch (result.type) {
      case 'block': {
        return `Block #${result.data.number || result.id}`
      }
      case 'extrinsic': {
        return result.data.module && result.data.call
          ? `${result.data.module}.${result.data.call}`
          : `Extrinsic ${result.id}`
      }
      case 'rollup': {
        return result.data.name || `Rollup ${result.id}`
      }
      case 'data_submission': {
        return `Data Submission #${result.id}`
      }
      default:
        return result.context || 'Unknown'
    }
  }

  const getResultSubtitle = (result: ExtendedSearchResult) => {
    switch (result.type) {
      case 'block': {
        return `${result.data.extrinsicsCount || 0} extrinsics • ${result.data.finalized ? 'Finalized' : 'Pending'}`
      }
      case 'extrinsic': {
        return `Block #${result.data.blockNumber || result.data.block_number} • ${result.data.success ? 'Success' : 'Failed'}`
      }
      case 'rollup': {
        return (
          result.data.description ||
          `App ID: ${result.data.appId || result.data.app_id}`
        )
      }
      case 'data_submission': {
        return `Size: ${result.data.dataSize || result.data.data_size} bytes • App ID: ${result.data.appId || result.data.app_id}`
      }
      default:
        return result.context || ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64',
            className
          )}
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="hidden lg:inline-flex">{placeholder}</span>
          <span className="inline-flex lg:hidden">Search...</span>
          {showShortcut && (
            <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-8 border-0 focus-visible:ring-0 text-base"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto">
          {isLoading && query.length > 2 && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                Searching...
              </span>
            </div>
          )}

          {!isLoading && query.length > 2 && allResults.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {allResults.length > 0 && (
            <div className="p-2">
              {allResults.map((result, index) => (
                <button
                  key={`${result.type}-${index}`}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-md p-3 text-left transition-colors hover:bg-accent',
                    index === selectedIndex && 'bg-accent'
                  )}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    {getResultIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {getResultTitle(result)}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {result.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {getResultSubtitle(result)}
                    </p>
                  </div>
                  {result.score && (
                    <div className="text-xs text-muted-foreground">
                      {Math.round((1 - result.score) * 100)}%
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {query.length <= 2 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Type at least 3 characters to search
            </div>
          )}
        </div>

        <div className="border-t px-4 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
            <span>⌘K to open</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
