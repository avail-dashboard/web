'use client'

import { useState, useEffect, useRef } from 'react'
import { TrendingUp, TrendingDown, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import { TooltipItem } from 'chart.js'
import { createZoomableChartOptions, resetZoom, registerZoomPlugin } from '@/lib/chart-config'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeColors, getChartColorPalette } from '@/lib/chart-themes'

interface BalanceChartProps {
  address: string
}

interface BalanceDataPoint {
  date: string
  balance: number
  timestamp: number
}

export function BalanceChart({ address }: BalanceChartProps) {
  const { actualTheme } = useTheme()
  const themeColors = getThemeColors(actualTheme)
  const colors = getChartColorPalette(actualTheme, 1)
  const chartRef = useRef<any>(null)
  const [balanceData, setBalanceData] = useState<BalanceDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [zoomEnabled, setZoomEnabled] = useState(false)

  // Register zoom plugin
  useEffect(() => {
    registerZoomPlugin().then(setZoomEnabled)
  }, [])

  useEffect(() => {
    // TODO: Replace with actual API call to fetch balance history
    // For now, simulate loading and generate some mock data for demonstration
    setTimeout(() => {
      // Generate mock data for demonstration
      const mockData: BalanceDataPoint[] = []
      const baseBalance = 1000000 // Start with 1M AVAIL
      const now = Date.now()
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000)
        const variation = (Math.random() - 0.5) * 0.1 // ±10% variation
        const balance = baseBalance * (1 + variation * (i / 30)) // Slight trend over time
        
        mockData.push({
          date: date.toLocaleDateString(),
          balance: Math.max(0, balance),
          timestamp: date.getTime()
        })
      }
      
      setBalanceData(mockData)
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

  // Calculate percentage change
  const firstBalance = balanceData[0]?.balance || 0
  const lastBalance = balanceData[balanceData.length - 1]?.balance || 0
  const percentageChange =
    firstBalance > 0 ? ((lastBalance - firstBalance) / firstBalance) * 100 : 0
  const isPositive = percentageChange >= 0

  // Chart.js configuration
  const chartData = {
    labels: balanceData.map(point => {
      const date = new Date(point.timestamp)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Balance',
        data: balanceData.map(point => point.balance),
        borderColor: colors[0],
        backgroundColor: colors[0] + '1A', // 10% opacity
        tension: 0.4,
        fill: true,
        pointBackgroundColor: colors[0],
        pointBorderColor: themeColors.background,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const baseOptions = createZoomableChartOptions('line')
  const chartOptions = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: actualTheme === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: themeColors.foreground,
        bodyColor: themeColors.foreground,
        borderColor: themeColors.border,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
        callbacks: {
          title: function(context: TooltipItem<'line'>[]) {
            const index = context[0]?.dataIndex
            if (index !== undefined) {
              return balanceData[index]?.date || ''
            }
            return ''
          },
          label: function(context: TooltipItem<'line'>) {
            const value = context.parsed.y
            return `Balance: ${value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} AVAIL`
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: themeColors.foreground,
          maxTicksLimit: 7, // Show about 7 labels to avoid crowding
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        grid: {
          color: themeColors.grid,
        },
        ticks: {
          color: themeColors.foreground,
          callback: function(value: number | string) {
            return Number(value).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          },
          font: {
            size: 11,
          },
        },
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: colors[0],
      },
    },
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
      <div className="bg-muted/30 rounded-lg p-4 space-y-3">
        {/* Zoom Controls - Only show when zoom is enabled */}
        {zoomEnabled && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Chart Controls:</span>
              <button
                onClick={() => chartRef.current?.zoom(1.1)}
                className="p-1.5 rounded-lg bg-background hover:bg-background/80 transition-colors border"
                title="Zoom In"
              >
                <ZoomIn className="h-3 w-3" />
              </button>
              <button
                onClick={() => chartRef.current?.zoom(0.9)}
                className="p-1.5 rounded-lg bg-background hover:bg-background/80 transition-colors border"
                title="Zoom Out"
              >
                <ZoomOut className="h-3 w-3" />
              </button>
              <button
                onClick={() => resetZoom(chartRef)}
                className="p-1.5 rounded-lg bg-background hover:bg-background/80 transition-colors border"
                title="Reset Zoom"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
            <div className="text-xs text-muted-foreground">
              💡 Scroll to zoom • Drag to pan
            </div>
          </div>
        )}
        
        <div className="h-48">
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        </div>
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
