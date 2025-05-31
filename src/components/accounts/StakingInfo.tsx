'use client'

import { useState, useEffect } from 'react'
import { Shield, TrendingUp, Users, Award, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface StakingInfoProps {
  address: string
}

interface StakingData {
  isStaking: boolean
  stakedAmount: string
  nominations: Nomination[]
  rewards: StakingReward[]
  totalRewards: string
  unbondingPeriod: number
}

interface Nomination {
  validatorAddress: string
  validatorName?: string
  stakedAmount: string
  isActive: boolean
  commission: number
}

interface StakingReward {
  date: string
  amount: string
  validator: string
  era: number
}

export function StakingInfo({ address }: StakingInfoProps) {
  const [stakingData, setStakingData] = useState<StakingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual API call to fetch staking information
    // For now, simulate loading and then show no data state
    setTimeout(() => {
      setStakingData(null) // No mock data
      setLoading(false)
    }, 1000)
  }, [address])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="mt-4 text-muted-foreground">
            Loading staking information...
          </p>
        </div>
      </div>
    )
  }

  if (!stakingData) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground text-4xl mb-4">🏦</div>
        <h3 className="text-lg font-semibold mb-2">Staking Data Unavailable</h3>
        <p className="text-muted-foreground mb-4">
          Staking information requires API integration to fetch real data.
        </p>
        <div className="text-sm text-muted-foreground">
          Connect to the Avail API to view staking details, nominations, and
          rewards.
        </div>
      </div>
    )
  }

  if (!stakingData.isStaking) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground text-4xl mb-4">🏦</div>
        <h3 className="text-lg font-semibold mb-2">Not Staking</h3>
        <p className="text-muted-foreground mb-4">
          This account is not currently participating in staking.
        </p>
        <div className="text-sm text-muted-foreground">
          Start staking to earn rewards and help secure the network.
        </div>
      </div>
    )
  }

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`
  }

  return (
    <div className="space-y-6">
      {/* Staking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-4 w-4 text-avail-600" />
            <span className="text-sm font-medium">Total Staked</span>
          </div>
          <div className="text-xl font-bold text-avail-600">
            {formatAmount(stakingData.stakedAmount)} AVAIL
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Total Rewards</span>
          </div>
          <div className="text-xl font-bold text-green-600">
            {formatAmount(stakingData.totalRewards)} AVAIL
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Nominations</span>
          </div>
          <div className="text-xl font-bold text-blue-600">
            {stakingData.nominations.length}
          </div>
        </div>
      </div>

      {/* Nominations */}
      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <h4 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-avail-600" />
          Nominations
        </h4>

        {stakingData.nominations.length > 0 ? (
          <div className="space-y-3">
            {stakingData.nominations.map((nomination, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${nomination.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                    />
                    <div>
                      <div className="font-medium">
                        {nomination.validatorName ||
                          formatAddress(nomination.validatorAddress)}
                      </div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {formatAddress(nomination.validatorAddress)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold">
                      {formatAmount(nomination.stakedAmount)} AVAIL
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {nomination.commission}% commission
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      nomination.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {nomination.isActive ? 'Active' : 'Inactive'}
                  </span>

                  <Link
                    href={`/validators/${nomination.validatorAddress}`}
                    className="text-avail-600 hover:text-avail-700 flex items-center space-x-1"
                  >
                    <span>View Validator</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No nominations found
          </div>
        )}
      </div>

      {/* Recent Rewards */}
      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <h4 className="text-lg font-semibold mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2 text-avail-600" />
          Recent Rewards
        </h4>

        {stakingData.rewards.length > 0 ? (
          <div className="space-y-2">
            {stakingData.rewards.slice(0, 5).map((reward, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-sm">
                    <div className="font-medium">Era {reward.era}</div>
                    <div className="text-muted-foreground">{reward.date}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    +{formatAmount(reward.amount)} AVAIL
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {reward.validator}
                  </div>
                </div>
              </div>
            ))}

            {stakingData.rewards.length > 5 && (
              <div className="text-center pt-2">
                <button className="text-sm text-avail-600 hover:text-avail-700">
                  View all {stakingData.rewards.length} rewards
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No rewards found
          </div>
        )}
      </div>

      {/* Staking Info */}
      <div className="bg-muted/30 p-4 rounded-lg">
        <div className="text-sm text-muted-foreground">
          <div className="mb-2">
            <strong>Unbonding Period:</strong> {stakingData.unbondingPeriod}{' '}
            days
          </div>
          <div>
            Staked tokens are locked and require an unbonding period before they
            can be transferred.
          </div>
        </div>
      </div>
    </div>
  )
}
