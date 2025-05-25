'use client'

import { useState } from 'react'
import { useBlocks, useChainData, useBackendStatus } from '@/lib/hooks/useAvailAPI'
import { BackendStatus, StatusBadge } from '@/components/BackendStatus'
import { formatTimeAgo } from '@/lib/utils'
import { TokenDistributionChart } from '@/components/charts/TokenDistributionChart'
import { BlocksChart } from '@/components/charts/BlocksChart'
import { SearchComponent } from '@/components/dashboard/SearchComponent'
import { APICallMonitor } from '@/components/APICallMonitor'

export default function Dashboard() {
  // Using the new API hooks
  const { data: chainData, loading: chainLoading, error: chainError, refetch: refetchChain } = useChainData({
    refetchInterval: 60000 // Refresh every 60 seconds
  })
  
  const { data: latestBlocks, loading: blocksLoading, error: blocksError, refetch: refetchBlocks } = useBlocks(5, {
    refetchInterval: 15000 // Refresh every 15 seconds
  })
  
  const { isConnected } = useBackendStatus()

  const formatNumber = (num: number): string => {
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
          <p className="mt-4 text-muted-foreground">
            Loading dashboard...
          </p>
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
            <h1 className="text-2xl font-bold text-avail-600">Avail Explorer</h1>
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
                <div className="font-semibold">AVAIL ${chainData.tokenPrice.toFixed(8)}</div>
                <div className={`text-xs ${chainData.priceChange < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {chainData.priceChange > 0 ? '+' : ''}{chainData.priceChange.toFixed(2)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Backend Status Section */}
        <section className="mb-8">
          <BackendStatus showDetails={false} />
        </section>

        {/* Search Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Search</h2>
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <SearchComponent />
          </div>
        </section>

        {/* Chain Statistics */}
        {chainData && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Chain Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="text-2xl font-bold text-avail-600">{formatNumber(chainData.finalizedBlocks)}</div>
                <div className="text-sm text-muted-foreground">Finalized Blocks</div>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="text-2xl font-bold text-avail-600">{formatNumber(chainData.signedExtrinsics)}</div>
                <div className="text-sm text-muted-foreground">Signed Extrinsics</div>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="text-2xl font-bold text-avail-600">{chainData.stakedAmount} / {chainData.bondedAmount}</div>
                <div className="text-sm text-muted-foreground">Staked / Bonded</div>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="text-2xl font-bold text-avail-600">{formatNumber(chainData.holders)} / {formatNumber(chainData.totalAccounts)}</div>
                <div className="text-sm text-muted-foreground">Holders / Total Accounts</div>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="text-2xl font-bold text-avail-600">{formatNumber(chainData.transfers)}</div>
                <div className="text-sm text-muted-foreground">Transfers</div>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="text-2xl font-bold text-avail-600">{chainData.inflationRate}%</div>
                <div className="text-sm text-muted-foreground">Inflation Rate</div>
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
                    others: chainData.others
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
                  <BlocksChart blocks={latestBlocks} />
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    {blocksLoading ? 'Loading blocks...' : 'No block data available'}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Additional Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Token Distribution Details */}
          {chainData && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Distribution Details</h2>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Circulating</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{chainData.circulating.amount}</div>
                      <div className="text-xs text-muted-foreground">({chainData.circulating.percentage}%)</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Staking</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{chainData.staking.amount}</div>
                      <div className="text-xs text-muted-foreground">({chainData.staking.percentage}%)</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Treasury</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{chainData.treasury.amount}</div>
                      <div className="text-xs text-muted-foreground">({chainData.treasury.percentage}%)</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 bg-gray-500 rounded-full"></div>
                      <span className="text-sm">Others</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{chainData.others.amount}</div>
                      <div className="text-xs text-muted-foreground">({chainData.others.percentage}%)</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Latest Blocks */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Latest Blocks</h2>
              <button className="text-sm text-avail-600 hover:text-avail-700">View All</button>
            </div>
            <div className="bg-card rounded-lg border shadow-sm">
              {blocksLoading && !latestBlocks ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading blocks...
                </div>
              ) : latestBlocks && latestBlocks.length > 0 ? (
                <div className="divide-y">
                  {latestBlocks.map((block) => (
                    <div key={block.number} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-avail-600">#{block.number.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground font-mono">{block.hash}</div>
                        </div>
                        <div className="text-right text-sm">
                          <div>{formatTimeAgo(block.time)}</div>
                          <div className="text-xs text-muted-foreground">{block.extrinsics} extrinsics</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  {blocksError ? 'Error loading blocks' : 'No block data available'}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Avail Explorer Dashboard - Built with Next.js and Tailwind CSS</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 