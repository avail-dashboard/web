'use client'

import { useState, useEffect } from 'react'
import { useBlocks } from '@/lib/hooks/useAvailAPI'
import { formatTimeAgo } from '@/lib/utils'
import { ChevronLeft, ChevronRight, RefreshCw, Clock, Hash, Activity, Users } from 'lucide-react'
import Link from 'next/link'

interface BlockListProps {
  initialPage?: number
  pageSize?: number
  showHeader?: boolean
  compact?: boolean
}

export function BlockList({ 
  initialPage = 1, 
  pageSize = 20, 
  showHeader = true,
  compact = false 
}: BlockListProps) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  const { data: blocks, loading, error, refetch } = useBlocks(pageSize, {
    refetchInterval: autoRefresh ? 15000 : undefined // Auto-refresh every 15 seconds
  })

  // Auto-refresh toggle
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetch()
      }, 15000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refetch])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    // In a real implementation, this would trigger a new API call with pagination
    // For now, we're just showing the latest blocks
  }

  const formatNumber = (num: number): string => {
    return num.toLocaleString()
  }

  const getBlockStatus = (blockNumber: number) => {
    // Mock logic - in reality this would come from the API
    return 'Finalized'
  }

  if (loading && !blocks) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="mt-4 text-muted-foreground">Loading blocks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-2">Failed to Load Blocks</h3>
        <p className="text-muted-foreground mb-4">
          There was an error loading the block data.
        </p>
        <button
          onClick={() => refetch()}
          className="bg-avail-600 text-white px-4 py-2 rounded hover:bg-avail-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!blocks || blocks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold mb-2">No Blocks Found</h3>
        <p className="text-muted-foreground">No block data is currently available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Latest Blocks</h1>
            <p className="text-muted-foreground mt-1">
              Real-time view of the latest blocks on the Avail network
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Auto-refresh toggle */}
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span>Auto-refresh</span>
            </label>
            
            {/* Manual refresh */}
            <button
              onClick={() => refetch()}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-avail-600 text-white rounded hover:bg-avail-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      )}

      {/* Blocks Grid/List */}
      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div
            key={`${block.hash}-${index}`}
            className={`bg-card border rounded-lg hover:shadow-md transition-shadow ${
              compact ? 'p-4' : 'p-6'
            }`}
          >
            <div className="flex items-center justify-between">
              {/* Left side - Block info */}
              <div className="flex items-center space-x-6">
                {/* Block number */}
                <div className="text-center">
                  <Link
                    href={`/blocks/${block.number}`}
                    className="text-2xl font-bold text-avail-600 hover:text-avail-700"
                  >
                    #{formatNumber(block.number)}
                  </Link>
                  <div className="text-xs text-muted-foreground">Block</div>
                </div>

                {/* Block details */}
                <div className="space-y-2">
                  {/* Hash */}
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <Link
                      href={`/blocks/${block.number}`}
                      className="font-mono text-sm text-avail-600 hover:text-avail-700"
                    >
                      {compact 
                        ? `${block.hash.slice(0, 10)}...${block.hash.slice(-8)}`
                        : block.hash
                      }
                    </Link>
                  </div>

                  {/* Extrinsics count */}
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {block.extrinsics} extrinsic{block.extrinsics !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side - Status and time */}
              <div className="text-right space-y-2">
                {/* Status */}
                <div className="flex items-center justify-end space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    {getBlockStatus(block.number)}
                  </span>
                </div>

                {/* Timestamp */}
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(block.time)}</span>
                </div>
                
                {!compact && (
                  <div className="text-xs text-muted-foreground">
                    {new Date(block.time).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Additional info for non-compact view */}
            {!compact && block.parentHash && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Parent:</span>
                  <Link
                    href={`/blocks/${block.number - 1}`}
                    className="font-mono text-avail-600 hover:text-avail-700"
                  >
                    {`${block.parentHash.slice(0, 10)}...${block.parentHash.slice(-8)}`}
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination - Mock for now */}
      <div className="flex items-center justify-between pt-6">
        <div className="text-sm text-muted-foreground">
          Showing latest {blocks.length} blocks
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center space-x-1 px-3 py-2 border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>
          
          <span className="px-3 py-2 text-sm">
            Page {currentPage}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="flex items-center space-x-1 px-3 py-2 border rounded hover:bg-muted"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Loading indicator for auto-refresh */}
      {loading && blocks && (
        <div className="text-center py-2">
          <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Updating...</span>
          </div>
        </div>
      )}
    </div>
  )
} 