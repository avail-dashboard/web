'use client'

import React, { useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/BackendStatus'
import { RefreshIndicator } from '@/components/ui/RefreshIndicator'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'
import { useChainData, useBackendStatus } from '@/lib/hooks/useAvailAPI'

export const Header = React.memo(function Header() {
  const router = useRouter()
  const { isConnected } = useBackendStatus()

  const {
    data: chainData,
    loading: chainLoading,
    refreshing: chainRefreshing,
    error: chainError,
    refetch: refetchChain,
  } = useChainData({
    refetchInterval: 60000, // Refresh every 60 seconds
  })

  const handleRefresh = useCallback(() => {
    refetchChain()
    // Trigger a page refresh to update all data
    router.refresh()
  }, [refetchChain, router])

  // Memoize formatted price data to prevent unnecessary recalculations
  const priceData = useMemo(() => {
    if (!chainData) return null

    return {
      formattedPrice: `AVAIL $${(chainData.tokenPrice || 0).toFixed(8)}`,
      formattedChange: `${(chainData.priceChange || 0) > 0 ? '+' : ''}${(chainData.priceChange || 0).toFixed(2)}%`,
      changeColor:
        (chainData.priceChange || 0) < 0 ? 'text-red-500' : 'text-green-500',
    }
  }, [chainData?.tokenPrice, chainData?.priceChange])

  // Memoize button text to prevent unnecessary re-renders
  const buttonText = useMemo(() => {
    return chainLoading ? 'Loading...' : 'Refresh'
  }, [chainLoading])

  return (
    <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-avail-600 hover:text-avail-700 transition-colors">
              Avail Explorer
            </h1>
          </Link>
          <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Mainnet</span>
          </div>
          {/* Backend Status */}
          <StatusBadge />
        </div>

        <div className="flex items-center space-x-4">
          {!isConnected && (
            <div className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded">
              Backend offline - using fallback
            </div>
          )}
          {chainError && (
            <ErrorDisplay
              error={chainError}
              onRetry={handleRefresh}
              compact={true}
            />
          )}
          <RefreshIndicator isRefreshing={chainRefreshing} />
          <button
            onClick={handleRefresh}
            disabled={chainLoading}
            className="text-xs bg-avail-600 text-white px-3 py-1 rounded hover:bg-avail-700 disabled:opacity-50 transition-colors"
          >
            {buttonText}
          </button>
          {priceData && (
            <div className="text-right text-sm">
              <div className="font-semibold">{priceData.formattedPrice}</div>
              <div className={`text-xs ${priceData.changeColor}`}>
                {priceData.formattedChange}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
})
