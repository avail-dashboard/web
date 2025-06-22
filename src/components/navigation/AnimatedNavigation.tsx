'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useNavigation } from '@/contexts/NavigationContext'
import {
  Blocks,
  Activity,
  User,
  Layers,
  Shield,
  Search,
  Loader2,
  Hash,
  Package,
  Database,
  ChevronDown,
} from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { searchApi, SearchResult } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const iconMap = {
  blocks: Blocks,
  extrinsics: Activity,
  accounts: User,
  'data-submissions': Activity,
  rollups: Layers,
  validators: Shield,
}

const colorMap = {
  avail: 'text-avail-600 hover:text-avail-700',
  blue: 'text-blue-600 hover:text-blue-700',
  green: 'text-green-600 hover:text-green-700',
  purple: 'text-purple-600 hover:text-purple-700',
  orange: 'text-orange-600 hover:text-orange-700',
  red: 'text-red-600 hover:text-red-700',
}

export function AnimatedNavigation() {
  const pathname = usePathname()
  const { navigationItems } = useNavigation()

  // Determine active section from pathname
  const currentSection =
    navigationItems.find(item => {
      if (item.href === '/' && pathname === '/') return true
      if (item.href !== '/' && pathname.startsWith(item.href)) return true
      return false
    })?.id || null

  return (
    <AnimatePresence>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex items-center space-x-1"
      >
        {navigationItems.map(item => {
          const IconComponent = iconMap[item.id as keyof typeof iconMap]
          const isActive = currentSection === item.id
          const colorClass =
            colorMap[item.color as keyof typeof colorMap] || colorMap.avail
          const isDisabled = item.disabled

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                ease: 'easeOut',
                delay: navigationItems.indexOf(item) * 0.05,
              }}
            >
              {isDisabled ? (
                <div
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200 cursor-not-allowed opacity-50
                    text-muted-foreground
                  `}
                >
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  <span className="hidden xl:inline">{item.label}</span>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? `bg-${item.color}-50 ${colorClass} border border-${item.color}-200`
                        : `text-muted-foreground hover:text-foreground hover:bg-muted/50`
                    }
                  `}
                >
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  <span className="hidden xl:inline">{item.label}</span>
                </Link>
              )}
            </motion.div>
          )
        })}
      </motion.nav>
    </AnimatePresence>
  )
}

export function AnimatedSearchBar() {
  const [query, setQuery] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const router = useRouter()
  const searchRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Recent searches cache (max 5 items)
  const [recentSearches, setRecentSearches] = React.useState<string[]>([])

  // Load recent searches from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('avail-recent-searches')
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
    } catch (error) {
      console.warn('Failed to load recent searches:', error)
    }
  }, [])

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
    queryKey: ['header-search', debouncedQuery],
    queryFn: () => searchApi.search(debouncedQuery),
    enabled: debouncedQuery.length > 2,
    staleTime: 30000,
  })

  // Process results and group by category
  const categorizedResults = React.useMemo(() => {
    if (!searchResults?.results) return {}

    const categories: Record<string, SearchResult[]> = {}

    searchResults.results.forEach(result => {
      if (!categories[result.type]) {
        categories[result.type] = []
      }
      categories[result.type].push(result)
    })

    return categories
  }, [searchResults])

  // Flatten results for keyboard navigation
  const allResults = React.useMemo(() => {
    const results: SearchResult[] = []
    Object.values(categorizedResults).forEach(categoryResults => {
      results.push(...categoryResults)
    })
    return results
  }, [categorizedResults])

  // Handle input focus/blur and dropdown visibility
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleResultClick = React.useCallback(
    (result: SearchResult) => {
      setIsOpen(false)

      // Save to recent searches if it's a meaningful search
      if (query.length > 2) {
        const newRecentSearches = [
          query,
          ...recentSearches.filter(s => s !== query),
        ].slice(0, 5)
        setRecentSearches(newRecentSearches)
        try {
          localStorage.setItem(
            'avail-recent-searches',
            JSON.stringify(newRecentSearches)
          )
        } catch (error) {
          console.warn('Failed to save recent search:', error)
        }
      }

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
        default: {
          // Fallback to old behavior for unknown types
          router.push(`/blocks/${result.id}`)
          break
        }
      }
    },
    [query, recentSearches, router]
  )

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

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
          e.preventDefault()
          setIsOpen(false)
          inputRef.current?.blur()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, allResults, selectedIndex, handleResultClick])

  // Reset selection when results change
  React.useEffect(() => {
    setSelectedIndex(0)
  }, [allResults])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(value.length > 0)
  }

  const handleInputFocus = () => {
    if (query.length > 0 || recentSearches.length > 0) {
      setIsOpen(true)
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

  const getResultTitle = (result: SearchResult) => {
    switch (result.type) {
      case 'block': {
        return `Block #${result.data.number || result.id}`
      }
      case 'extrinsic': {
        return result.data.module && result.data.call
          ? `${result.data.module}.${result.data.call}`
          : `Extrinsic ${result.id.slice(0, 10)}...`
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

  const getResultSubtitle = (result: SearchResult) => {
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

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case 'block':
        return 'Blocks'
      case 'extrinsic':
        return 'Extrinsics'
      case 'rollup':
        return 'Rollups'
      case 'data_submission':
        return 'Data Submissions'
      default:
        return 'Other'
    }
  }

  const getCategoryIcon = (type: string) => {
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

  return (
    <motion.div
      ref={searchRef}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative w-full"
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="Search blocks, extrinsics, rollups..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-avail-500 focus:border-transparent text-sm transition-all duration-200 hover:border-avail-300"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        {isOpen && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden"
          >
            <div className="max-h-96 overflow-y-auto">
              {/* Loading State */}
              {isLoading && query.length > 2 && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">
                    Searching...
                  </span>
                </div>
              )}

              {/* No Results */}
              {!isLoading && query.length > 2 && allResults.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No results found for &quot;{query}&quot;
                  </p>
                </div>
              )}

              {/* Search Results by Category */}
              {allResults.length > 0 && (
                <div className="py-2">
                  {Object.entries(categorizedResults).map(
                    ([categoryType, results]) => (
                      <div key={categoryType} className="mb-1 last:mb-0">
                        {/* Category Header */}
                        <div className="px-3 py-2 border-b bg-muted/30">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(categoryType)}
                            <span className="text-sm font-medium text-muted-foreground">
                              {getCategoryLabel(categoryType)}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {results.length}
                            </Badge>
                          </div>
                        </div>

                        {/* Category Results */}
                        {results.map((result, categoryIndex) => {
                          const globalIndex = allResults.findIndex(
                            r => r === result
                          )
                          return (
                            <button
                              key={`${result.type}-${result.id}-${categoryIndex}`}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent',
                                globalIndex === selectedIndex && 'bg-accent'
                              )}
                              onClick={() => handleResultClick(result)}
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                                {getResultIcon(result.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium truncate text-sm">
                                    {getResultTitle(result)}
                                  </p>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {getResultSubtitle(result)}
                                </p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Minimum Query Length */}
              {query.length > 0 && query.length <= 2 && (
                <div className="py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Type at least 3 characters to search
                  </p>
                </div>
              )}

              {/* Recent Searches */}
              {query.length === 0 && recentSearches.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-2 border-b bg-muted/30">
                    <span className="text-sm font-medium text-muted-foreground">
                      Recent Searches
                    </span>
                  </div>
                  {recentSearches.map((recentQuery, index) => (
                    <button
                      key={`recent-${index}`}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent"
                      onClick={() => {
                        setQuery(recentQuery)
                        // Don't close dropdown, let user see the results
                      }}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                        <Search className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">
                          {recentQuery}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Keyboard Navigation Hint */}
              {allResults.length > 0 && (
                <div className="border-t px-3 py-2 bg-muted/20">
                  <p className="text-xs text-muted-foreground">
                    Use ↑↓ to navigate, Enter to select, Esc to close
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
