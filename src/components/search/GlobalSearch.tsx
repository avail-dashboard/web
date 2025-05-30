"use client"

import * as React from "react"
import { Search, Loader2, Hash, User, Blocks, Shield } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Fuse from "fuse.js"

import { cn } from "@/lib/utils"
import { searchApi, Block, Extrinsic, Account, Validator } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface SearchResult {
  type: 'block' | 'extrinsic' | 'account' | 'validator'
  data: Block | Extrinsic | Account | Validator
  score?: number
}

interface GlobalSearchProps {
  className?: string
  placeholder?: string
  showShortcut?: boolean
}

export function GlobalSearch({ 
  className, 
  placeholder = "Search blocks, extrinsics, accounts...",
  showShortcut = true 
}: GlobalSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const router = useRouter()

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = React.useState("")
  
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

  // Flatten and score results
  const allResults = React.useMemo(() => {
    if (!searchResults) return []

    const results: SearchResult[] = [
      ...searchResults.blocks.map(block => ({ type: 'block' as const, data: block })),
      ...searchResults.extrinsics.map(extrinsic => ({ type: 'extrinsic' as const, data: extrinsic })),
      ...searchResults.accounts.map(account => ({ type: 'account' as const, data: account })),
      ...searchResults.validators.map(validator => ({ type: 'validator' as const, data: validator })),
    ]

    // Use Fuse.js for better fuzzy search scoring
    const fuse = new Fuse(results, {
      keys: [
        { name: 'data.hash', weight: 1.0 },
        { name: 'data.number', weight: 0.9 },
        { name: 'data.address', weight: 1.0 },
        { name: 'data.identity.display', weight: 0.8 },
        { name: 'data.method', weight: 0.7 },
        { name: 'data.section', weight: 0.6 },
      ],
      threshold: 0.4,
      includeScore: true,
    })

    if (debouncedQuery.length > 2) {
      return fuse.search(debouncedQuery).map(result => ({
        ...result.item,
        score: result.score,
      }))
    }

    return results.slice(0, 10)
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

  const handleResultClick = (result: SearchResult) => {
    setOpen(false)
    setQuery("")
    
    switch (result.type) {
      case 'block': {
        const block = result.data as Block
        router.push(`/blocks/${block.number}`)
        break
      }
      case 'extrinsic': {
        const extrinsic = result.data as Extrinsic
        router.push(`/extrinsics/${extrinsic.hash}`)
        break
      }
      case 'account': {
        const account = result.data as Account
        router.push(`/accounts/${account.address}`)
        break
      }
      case 'validator': {
        const validator = result.data as Validator
        router.push(`/validators/${validator.address}`)
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
      case 'account':
        return <User className="h-4 w-4" />
      case 'validator':
        return <Shield className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getResultTitle = (result: SearchResult) => {
    switch (result.type) {
      case 'block': {
        const block = result.data as Block
        return `Block #${block.number}`
      }
      case 'extrinsic': {
        const extrinsic = result.data as Extrinsic
        return `${extrinsic.section}.${extrinsic.method}`
      }
      case 'account': {
        const account = result.data as Account
        return account.identity?.display || `${account.address.slice(0, 8)}...${account.address.slice(-8)}`
      }
      case 'validator': {
        const validator = result.data as Validator
        return validator.identity?.display || `${validator.address.slice(0, 8)}...${validator.address.slice(-8)}`
      }
      default:
        return 'Unknown'
    }
  }

  const getResultSubtitle = (result: SearchResult) => {
    switch (result.type) {
      case 'block': {
        const block = result.data as Block
        return `${block.extrinsicsCount} extrinsics • ${block.status}`
      }
      case 'extrinsic': {
        const extrinsic = result.data as Extrinsic
        return `Block #${extrinsic.blockNumber} • ${extrinsic.success ? 'Success' : 'Failed'}`
      }
      case 'account': {
        const account = result.data as Account
        return `${account.extrinsicsCount} extrinsics • ${account.transfersCount} transfers`
      }
      case 'validator': {
        const validator = result.data as Validator
        return `${validator.blocksProduced} blocks • ${validator.active ? 'Active' : 'Inactive'}`
      }
      default:
        return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64",
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
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 border-0 focus-visible:ring-0 text-base"
              autoFocus
            />
          </div>
        </DialogHeader>
        
        <div className="max-h-96 overflow-y-auto">
          {isLoading && query.length > 2 && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
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
                    "w-full flex items-center gap-3 rounded-md p-3 text-left transition-colors hover:bg-accent",
                    index === selectedIndex && "bg-accent"
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