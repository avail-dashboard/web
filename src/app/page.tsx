'use client'

import { useState, useEffect } from 'react'

// Mock data similar to avail.subscan.io
const mockChainData = {
  finalizedBlocks: 1399813,
  signedExtrinsics: 576934,
  stakedAmount: '5.383B',
  bondedAmount: '5.386B',
  holders: 203302,
  totalAccounts: 288348,
  transfers: 643469,
  inflationRate: 4.22,
  tokenPrice: 0.03645154,
  priceChange: -4.81,
  totalIssuance: '10.442B',
  circulating: { amount: '4.819B', percentage: 46.14 },
  staking: { amount: '5.386B', percentage: 51.57 },
  treasury: { amount: '230.471M', percentage: 2.20 },
  others: { amount: '7.209M', percentage: 0.06 }
}

const mockLatestBlocks = [
  { number: 1399813, hash: '0x1a2b3c...', time: Date.now() - 6000, extrinsics: 3 },
  { number: 1399812, hash: '0x2b3c4d...', time: Date.now() - 12000, extrinsics: 2 },
  { number: 1399811, hash: '0x3c4d5e...', time: Date.now() - 18000, extrinsics: 1 },
  { number: 1399810, hash: '0x4d5e6f...', time: Date.now() - 24000, extrinsics: 4 },
  { number: 1399809, hash: '0x5e6f7g...', time: Date.now() - 30000, extrinsics: 2 }
]

export default function Dashboard() {
  const [chainData, setChainData] = useState(mockChainData)
  const [latestBlocks, setLatestBlocks] = useState(mockLatestBlocks)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

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

  if (isLoading) {
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
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-avail-600">Avail Explorer</h1>
            <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Mainnet</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right text-sm">
              <div className="font-semibold">AVAIL ${chainData.tokenPrice.toFixed(8)}</div>
              <div className={`text-xs ${chainData.priceChange < 0 ? 'text-red-500' : 'text-green-500'}`}>
                {chainData.priceChange > 0 ? '+' : ''}{chainData.priceChange.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Chain Statistics */}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Token Distribution */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Token Distribution</h2>
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <div className="text-lg font-semibold mb-4">Total Issuance: {chainData.totalIssuance}</div>
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

          {/* Latest Blocks */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Latest Blocks</h2>
              <button className="text-sm text-avail-600 hover:text-avail-700">View All</button>
            </div>
            <div className="bg-card rounded-lg border shadow-sm">
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