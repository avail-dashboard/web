'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface BalanceChartProps {
  address: string
}

interface BalanceDataPoint {
  date: string
  balance: number
  timestamp: number
}

export function BalanceChart({ address }: BalanceChartProps) {
  const [balanceData, setBalanceData] = useState<BalanceDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual API call to fetch balance history
    // For now, simulate loading and then show no data state
    setTimeout(() => {
      setBalanceData([]) // No mock data
      setLoading(false)
    }, 1000)
  }, [address])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="mt-4 text-muted-foreground text-sm">
            Loading balance history...
          </p>
        </div>
      </div>
    )
  }

  if (balanceData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-muted-foreground text-4xl mb-4">📊</div>
          <p className="text-muted-foreground mb-2">
            No balance history available
          </p>
          <p className="text-sm text-muted-foreground">
            Balance history requires API integration to fetch historical data.
          </p>
        </div>
      </div>
    )
  }

  // Calculate min and max for scaling
  const balances = balanceData.map(d => d.balance)
  const minBalance = Math.min(...balances)
  const maxBalance = Math.max(...balances)
  const range = maxBalance - minBalance || 1

  // Calculate percentage change
  const firstBalance = balanceData[0]?.balance || 0
  const lastBalance = balanceData[balanceData.length - 1]?.balance || 0
  const percentageChange =
    firstBalance > 0 ? ((lastBalance - firstBalance) / firstBalance) * 100 : 0
  const isPositive = percentageChange >= 0

  // Generate SVG path
  const width = 400
  const height = 200
  const padding = 20

  const points = balanceData
    .map((point, index) => {
      const x =
        padding + (index / (balanceData.length - 1)) * (width - 2 * padding)
      const y =
        height -
        padding -
        ((point.balance - minBalance) / range) * (height - 2 * padding)
      return `${x},${y}`
    })
    .join(' ')

  const pathData = `M ${points.split(' ').join(' L ')}`

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">
            {lastBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            AVAIL
          </div>
          <div className="text-sm text-muted-foreground">Current Balance</div>
        </div>

        <div
          className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}
        >
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span className="font-medium">
            {isPositive ? '+' : ''}
            {percentageChange.toFixed(2)}%
          </span>
          <span className="text-sm text-muted-foreground">30d</span>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-muted/30 rounded-lg p-4">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
        >
          {/* Grid lines */}
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Area under the curve */}
          <path
            d={`${pathData} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`}
            fill="currentColor"
            fillOpacity="0.1"
            className="text-avail-600"
          />

          {/* Main line */}
          <path
            d={pathData}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-avail-600"
          />

          {/* Data points */}
          {balanceData.map((point, index) => {
            const x =
              padding +
              (index / (balanceData.length - 1)) * (width - 2 * padding)
            const y =
              height -
              padding -
              ((point.balance - minBalance) / range) * (height - 2 * padding)

            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="currentColor"
                className="text-avail-600"
              >
                <title>{`${point.date}: ${point.balance.toFixed(2)} AVAIL`}</title>
              </circle>
            )
          })}
        </svg>
      </div>

      {/* Time range indicator */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{balanceData[0]?.date}</span>
        <span>30 days</span>
        <span>{balanceData[balanceData.length - 1]?.date}</span>
      </div>
    </div>
  )
}
