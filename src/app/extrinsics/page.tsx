'use client'

import { useState } from 'react'
import { useExtrinsics } from '@/lib/hooks/useAvailAPI'
import { ExtrinsicList } from '@/components/blocks/ExtrinsicList'
import { RefreshCw } from 'lucide-react'

export default function ExtrinsicsPage() {
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(20)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const {
    data: extrinsics,
    loading,
    error,
    refetch,
  } = useExtrinsics(
    undefined, // No specific block
    currentPage,
    pageSize
  )

  if (loading && !extrinsics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
        <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-avail-600">
                Avail Explorer
              </h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Mainnet</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <p className="mt-4 text-muted-foreground">Loading extrinsics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
        <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-avail-600">
                Avail Explorer
              </h1>
            </div>
          </div>
        </header>

        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold mb-2">
            Failed to Load Extrinsics
          </h3>
          <p className="text-muted-foreground mb-4">
            There was an error loading the extrinsic data.
          </p>
          <button
            onClick={() => refetch()}
            className="bg-avail-600 text-white px-4 py-2 rounded hover:bg-avail-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-avail-600">
              Avail Explorer
            </h1>
            <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Mainnet</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Latest Extrinsics</h1>
            <p className="text-muted-foreground mt-1">
              Real-time view of the latest transactions on the Avail network
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Auto-refresh toggle */}
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={e => setAutoRefresh(e.target.checked)}
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
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Extrinsics List */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          {extrinsics && extrinsics.length > 0 ? (
            <ExtrinsicList
              extrinsics={extrinsics}
              showBlockNumber={true}
              compact={false}
              showFilters={true}
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold mb-2">
                No Extrinsics Found
              </h3>
              <p className="text-muted-foreground">
                No extrinsic data is currently available.
              </p>
            </div>
          )}
        </div>

        {/* Loading indicator for auto-refresh */}
        {loading && extrinsics && (
          <div className="text-center py-4">
            <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Updating...</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
