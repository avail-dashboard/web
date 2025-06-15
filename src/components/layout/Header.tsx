'use client'

import React, { useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { StatusBadge } from '@/components/BackendStatus'
import { RefreshIndicator } from '@/components/ui/RefreshIndicator'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'
import { useChainData, useBackendStatus } from '@/lib/hooks/useAvailAPI'
import { AnimatedNavigation, AnimatedSearchBar } from '@/components/navigation/AnimatedNavigation'
import { MobileNavigation } from '@/components/navigation/MobileNavigation'

export const Header = React.memo(function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { isConnected, isChecking } = useBackendStatus()
  
  const isHomepage = pathname === '/'

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
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex flex-col items-center">
            <Image
              src="/avail-logo.png"
              alt="Avail"
              width={120}
              height={40}
              className="h-8 w-auto hover:opacity-80 transition-opacity"
              priority
            />
            <span className="text-xs font-medium text-muted-foreground mt-1">
              Explorer
            </span>
          </Link>
          <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Mainnet</span>
          </div>
          {/* Backend Status */}
          <StatusBadge />
          
          {/* Navigation - only show on non-homepage */}
          {!isHomepage && (
            <div className="hidden lg:block">
              <AnimatedNavigation />
            </div>
          )}
        </div>

        {/* Center section for search on non-homepage */}
        {!isHomepage && (
          <div className="flex-1 max-w-md mx-4">
            <AnimatedSearchBar />
          </div>
        )}

        <div className="flex items-center space-x-4">
          {/* Mobile Navigation - only show on dedicated pages */}
          <MobileNavigation isHomepage={isHomepage} />
          
          {/* Show consistent status message */}
          {isChecking ? (
            <div className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded">
              Checking backend status...
            </div>
          ) : !isConnected ? (
            <div className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded">
              Backend offline - using fallback
            </div>
          ) : null}
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
