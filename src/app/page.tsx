'use client'

import React from 'react'
import {
  useBlocks,
  useChainData,
  useBackendStatus,
} from '@/lib/hooks/useAvailAPI'
import { StatusBadge } from '@/components/BackendStatus'
import { TokenDistributionChart } from '@/components/charts/TokenDistributionChart'
import { BlocksChart } from '@/components/charts/BlocksChart'
import { SearchComponent } from '@/components/dashboard/SearchComponent'
import { TransfersTable } from '@/components/transfers/TransfersTable'
import Link from 'next/link'
import { Blocks, Activity, User, Search, ArrowRight } from 'lucide-react'

export default function Dashboard() {
  // Using the new API hooks
  const {
    data: chainData,
    loading: chainLoading,
    error: chainError,
    refetch: refetchChain,
  } = useChainData({
    refetchInterval: 60000, // Refresh every 60 seconds
  })

  const {
    data: latestBlocks,
    loading: blocksLoading,
    error: blocksError,
    refetch: refetchBlocks,
  } = useBlocks(5, {
    refetchInterval: 15000, // Refresh every 15 seconds
  })

  const { isConnected } = useBackendStatus()

  const formatNumber = (num: number | undefined | null): string => {
    if (!num || isNaN(num)) return '0'
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
    return num.toLocaleString()
  }

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  const isLoading = chainLoading || blocksLoading
  const hasError = chainError || blocksError

  if (isLoading && !chainData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      {/* API Call Monitor for debugging */}
      {/* {process.env.NODE_ENV === 'development' && <APICallMonitor />} */}

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
            {/* Backend Status */}
            <StatusBadge />
          </div>
          <div className="flex items-center space-x-4">
            {!isConnected && (
              <div className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded">
                Backend offline - using fallback
              </div>
            )}
            {hasError && (
              <div className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                Data loading error
              </div>
            )}
            <button
              onClick={() => {
                refetchChain()
                refetchBlocks()
              }}
              disabled={isLoading}
              className="text-xs bg-avail-600 text-white px-3 py-1 rounded hover:bg-avail-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
            {chainData && (
              <div className="text-right text-sm">
                <div className="font-semibold">
                  AVAIL ${chainData.tokenPrice?.toFixed(8) || '0.00000000'}
                </div>
                <div
                  className={`text-xs ${(chainData.priceChange || 0) < 0 ? 'text-red-500' : 'text-green-500'}`}
                >
                  {(chainData.priceChange || 0) > 0 ? '+' : ''}
                  {(chainData.priceChange || 0).toFixed(2)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Search</h2>
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <SearchComponent />
          </div>
        </section>

        {/* Explorer Navigation */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Explore the Network</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Blocks Explorer */}
            <Link href="/blocks" className="group">
              <div className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 group-hover:border-avail-600/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-avail-100 rounded-lg group-hover:bg-avail-200 transition-colors">
                      <Blocks className="h-6 w-6 text-avail-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Blocks</h3>
                      <p className="text-sm text-muted-foreground">
                        Explore blockchain blocks
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-avail-600 transition-colors" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Latest Block:</span>
                    <span className="font-mono">
                      {latestBlocks && latestBlocks.length > 0
                        ? `#${formatNumber(latestBlocks[0].number)}`
                        : chainData
                        ? `#${formatNumber(chainData.finalizedBlocks)}`
                        : 'Loading...'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Block Time:</span>
                    <span>~12 seconds</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Extrinsics Explorer */}
            <Link href="/extrinsics" className="group">
              <div className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 group-hover:border-avail-600/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Activity className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Transactions</h3>
                      <p className="text-sm text-muted-foreground">
                        Browse all extrinsics
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total Extrinsics:
                    </span>
                    <span className="font-mono">
                      {chainData
                        ? formatNumber(chainData.signedExtrinsics)
                        : 'Loading...'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Success Rate:</span>
                    <span className="text-green-600">~98.5%</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Account Search */}
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Accounts</h3>
                    <p className="text-sm text-muted-foreground">
                      Search account details
                    </p>
                  </div>
                </div>
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter account address..."
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-avail-600/20 focus:border-avail-600"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const address = (
                        e.target as HTMLInputElement
                      ).value.trim()
                      if (address) {
                        window.location.href = `/accounts/${address}`
                      }
                    }
                  }}
                />
                <div className="text-xs text-muted-foreground">
                  Press Enter to search or try:
                  5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
                </div>
              </div>
            </div>

            {/* Data Submissions Explorer */}
            <Link href="/data-submissions" className="group">
              <div className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 group-hover:border-purple-600/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <Activity className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        Data Submissions
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Browse data availability submissions
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-600 transition-colors" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Data Submissions:
                    </span>
                    <span className="font-mono">Loading...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unique Apps:</span>
                    <span>Loading...</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Chain Statistics */}
        {chainData && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Chain Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="text-2xl font-bold text-avail-600">
                  {formatNumber(chainData.finalizedBlocks)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Finalized Blocks
                </div>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="text-2xl font-bold text-avail-600">
                  {formatNumber(chainData.signedExtrinsics)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Signed Extrinsics
                </div>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="text-2xl font-bold text-avail-600">
                  {chainData.stakedAmount} / {chainData.bondedAmount}
                </div>
                <div className="text-sm text-muted-foreground">
                  Staked / Bonded
                </div>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="text-2xl font-bold text-avail-600">
                  {formatNumber(chainData.holders)} /{' '}
                  {formatNumber(chainData.totalAccounts)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Holders / Total Accounts
                </div>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="text-2xl font-bold text-avail-600">
                  {formatNumber(chainData.transfers)}
                </div>
                <div className="text-sm text-muted-foreground">Transfers</div>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="text-2xl font-bold text-avail-600">
                  {chainData.inflationRate}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Inflation Rate
                </div>
              </div>
            </div>
          </section>
        )}

        {chainData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Token Distribution Chart */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Token Distribution</h2>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <TokenDistributionChart
                  data={{
                    circulating: chainData.circulating,
                    staking: chainData.staking,
                    treasury: chainData.treasury,
                    others: chainData.others,
                  }}
                  totalIssuance={chainData.totalIssuance}
                />
              </div>
            </section>

            {/* Block Activity Chart */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Block Activity</h2>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                {latestBlocks && latestBlocks.length > 0 ? (
                  <BlocksChart
                    blocks={latestBlocks.map(block => ({
                      number: block.number,
                      time: new Date(block.timestamp).getTime(),
                      extrinsics: block.extrinsicsCount,
                    }))}
                  />
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    {blocksLoading
                      ? 'Loading blocks...'
                      : 'No block data available'}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Additional Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Latest Blocks */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Latest Blocks</h2>
              <Link
                href="/blocks"
                className="text-sm text-avail-600 hover:text-avail-700"
              >
                View All
              </Link>
            </div>
            <div className="bg-card rounded-lg border shadow-sm">
              {blocksLoading && !latestBlocks ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading blocks...
                </div>
              ) : latestBlocks && latestBlocks.length > 0 ? (
                <div className="divide-y">
                  {latestBlocks.map(block => (
                    <Link key={block.number} href={`/blocks/${block.number}`}>
                      <div className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-avail-600">
                              #{block.number.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {block.hash.slice(0, 20)}...{block.hash.slice(-8)}
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div>
                              {formatTimeAgo(
                                new Date(block.timestamp).getTime()
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {block.extrinsicsCount} extrinsics
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  {blocksError
                    ? 'Error loading blocks'
                    : 'No block data available'}
                </div>
              )}
            </div>
          </section>

          {/* Recent Transfers */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Transfers</h2>
              <Link
                href="/extrinsics"
                className="text-sm text-avail-600 hover:text-avail-700"
              >
                View All
              </Link>
            </div>
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <TransfersTable limit={5} showHeader={false} compact={true} />
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Avail Explorer Dashboard - Built with Next.js and Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
