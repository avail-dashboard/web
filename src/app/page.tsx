'use client'

import { useBlocks, useChainData } from '@/lib/hooks/useAvailAPI'
import { TokenDistributionChart } from '@/components/charts/TokenDistributionChart'
import { BlocksChart } from '@/components/charts/BlocksChart'
import { SearchComponent } from '@/components/dashboard/SearchComponent'
import { TransfersTable } from '@/components/transfers/TransfersTable'
import { AnimatedNavigationCard } from '@/components/navigation/AnimatedNavigationCard'
import { formatTimeAgo } from '@/lib/utils'
import Link from 'next/link'
import { Blocks, Activity, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  // Using the new API hooks
  const { data: chainData, loading: chainLoading } = useChainData({
    refetchInterval: 60000, // Refresh every 60 seconds
  })

  const {
    data: latestBlocks,
    loading: blocksLoading,
    error: blocksError,
  } = useBlocks(5, {
    refetchInterval: 15000, // Refresh every 15 seconds
  })

  const formatNumber = (num: number | undefined | null): string => {
    if (!num || isNaN(num)) return '0'
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
    return num.toLocaleString()
  }

  const isLoading = chainLoading || blocksLoading

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
    <div className="app-container py-8">
      {/* Search Section */}
      <section className="mb-8">
        <div>
          <SearchComponent />
        </div>
      </section>

      {/* Explorer Navigation */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Explore the Network</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Blocks Explorer */}
          <AnimatedNavigationCard
            id="blocks"
            title="Blocks"
            description="Explore blockchain blocks"
            icon={<Blocks className="h-6 w-6 text-avail-600" />}
            href="/blocks"
            colorClass="avail"
            stats={[
              {
                label: "Latest Block",
                value: latestBlocks && latestBlocks.length > 0
                  ? `#${formatNumber(latestBlocks[0].number)}`
                  : chainData
                    ? `#${formatNumber(chainData.finalizedBlocks)}`
                    : 'Loading...'
              },
              {
                label: "Block Time",
                value: "~12 seconds"
              }
            ]}
          />

          {/* Extrinsics Explorer */}
          <AnimatedNavigationCard
            id="extrinsics"
            title="Transactions"
            description="Browse all extrinsics"
            icon={<Activity className="h-6 w-6 text-blue-600" />}
            href="/extrinsics"
            colorClass="blue"
            stats={[
              {
                label: "Total Extrinsics",
                value: chainData
                  ? formatNumber(chainData.signedExtrinsics)
                  : 'Loading...'
              },
              {
                label: "Success Rate",
                value: "~98.5%"
              }
            ]}
          />

          {/* Account Search */}
          <AnimatedNavigationCard
            id="accounts"
            title="Accounts"
            description="Search account details"
            icon={<User className="h-6 w-6 text-green-600" />}
            href="/accounts"
            colorClass="green"
          >
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter account address..."
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-avail-600/20 focus:border-avail-600"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const address = (e.target as HTMLInputElement).value.trim()
                    if (address) {
                      router.push(`/accounts/${address}`)
                    }
                  }
                }}
              />
              <div className="text-xs text-muted-foreground">
                Press Enter to search or try:
                5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
              </div>
            </div>
          </AnimatedNavigationCard>

          {/* Data Submissions Explorer */}
          <AnimatedNavigationCard
            id="data-submissions"
            title="Data Submissions"
            description="Browse data availability submissions"
            icon={<Activity className="h-6 w-6 text-purple-600" />}
            href="/data-submissions"
            colorClass="purple"
            stats={[
              {
                label: "Data Submissions",
                value: "Loading..."
              },
              {
                label: "Unique Apps",
                value: "Loading..."
              }
            ]}
          />
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
                    extrinsics: block.extrinsicsCount || block.extrinsics || 0,
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
                            {block.hash && block.hash.trim()
                              ? `${block.hash.slice(0, 20)}...${block.hash.slice(-8)}`
                              : 'Hash not available'}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div>
                            {formatTimeAgo(block.timestamp)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {block.extrinsicsCount || block.extrinsics || 0}{' '}
                            extrinsics
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
    </div>
  )
}
