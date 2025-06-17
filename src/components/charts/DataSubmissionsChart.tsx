'use client'

import { Bar } from 'react-chartjs-2'
import { TooltipItem } from 'chart.js'
import { formatTimeAgo } from '@/lib/utils'
import { createBaseChartOptions, getAppIdColor } from '@/lib/chart-config'

// Helper function to format data size
const formatDataSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}


// Generate nice, round tick values for Y-axis based on data size
const generateNiceDataSizeTicks = (maxValue: number): number[] => {
  if (maxValue === 0) return [0]
  
  // Define nice round values in bytes
  const niceValues = [
    // Bytes
    100, 250, 500, 1000,
    // KB
    2 * 1024, 5 * 1024, 10 * 1024, 25 * 1024, 50 * 1024, 100 * 1024, 250 * 1024, 500 * 1024,
    // MB  
    1024 * 1024, 2 * 1024 * 1024, 5 * 1024 * 1024, 10 * 1024 * 1024, 
    25 * 1024 * 1024, 50 * 1024 * 1024, 100 * 1024 * 1024, 250 * 1024 * 1024, 500 * 1024 * 1024,
    // GB
    1024 * 1024 * 1024, 2 * 1024 * 1024 * 1024, 5 * 1024 * 1024 * 1024, 10 * 1024 * 1024 * 1024
  ]
  
  // Find appropriate tick interval
  const targetTicks = 5 // Aim for about 5 ticks
  const roughInterval = maxValue / targetTicks
  
  // Find the smallest nice value that's >= roughInterval
  const interval = niceValues.find(val => val >= roughInterval) || maxValue / targetTicks
  
  // Generate ticks
  const ticks: number[] = [0]
  let tick = interval
  while (tick <= maxValue * 1.1) { // Go slightly beyond max for better visualization
    ticks.push(tick)
    tick += interval
  }
  
  return ticks
}

// Type for chart data point
interface ChartDataPoint {
  blockNumber: number
  timestamp: string
  [key: string]: number | string // Dynamic keys for app_${appId} and timestamp
}

interface DataSubmissionsChartProps {
  chartData: ChartDataPoint[]
  appIds: number[]
}

export function DataSubmissionsChart({ chartData, appIds }: DataSubmissionsChartProps) {
  if (!chartData.length || !appIds.length) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No data available for chart visualization</p>
          <p className="text-xs">Load more submissions to see chart data</p>
        </div>
      </div>
    )
  }

  // Calculate max value for Y-axis ticks
  const maxValue = Math.max(
    ...chartData.map(dataPoint => 
      appIds.reduce((sum, appId) => {
        const value = dataPoint[`app_${appId}`]
        return sum + (typeof value === 'number' ? value : 0)
      }, 0)
    )
  )

  const data = {
    labels: chartData.map(point => point.blockNumber.toString()),
    datasets: appIds.map(appId => ({
      label: `App ID ${appId}`,
      data: chartData.map(point => point[`app_${appId}`] as number || 0),
      backgroundColor: getAppIdColor(appId),
      borderColor: getAppIdColor(appId),
      borderWidth: 1,
      stack: 'submissions',
    }))
  }

  const baseOptions = createBaseChartOptions('bar')
  const options = {
    ...baseOptions,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      ...baseOptions.plugins,
      title: {
        display: false, // We handle title externally
      },
      legend: {
        ...baseOptions.plugins.legend,
        position: 'bottom' as const,
      },
      tooltip: {
        ...baseOptions.plugins.tooltip,
        callbacks: {
          title: function(context: TooltipItem<'bar'>[]) {
            const dataIndex = context[0]?.dataIndex
            if (dataIndex !== undefined && chartData[dataIndex]) {
              const blockNumber = chartData[dataIndex].blockNumber
              const timestamp = chartData[dataIndex].timestamp
              const formattedTime = timestamp ? formatTimeAgo(timestamp) : ''
              return `Block: #${blockNumber}${formattedTime ? `\n${formattedTime}` : ''}`
            }
            // Fallback to label if dataIndex is not available
            const blockNumber = context[0]?.label || 'Unknown'
            return `Block: #${blockNumber}`
          },
          label: function(context: TooltipItem<'bar'>) {
            const value = context.parsed.y
            if (value === 0) return undefined // Don't show zero values
            return `${context.dataset.label}: ${formatDataSize(value)}`
          },
          footer: function(tooltipItems: TooltipItem<'bar'>[]) {
            // Show total data size for this block
            const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0)
            return total > 0 ? [`Total: ${formatDataSize(total)}`] : []
          }
        },
        filter: function(tooltipItem: TooltipItem<'bar'>) {
          // Only show tooltip items with non-zero values
          return tooltipItem.parsed.y > 0
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Block Number',
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          font: {
            size: 12
          }
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Data Size',
        },
        ticks: {
          callback: function(value: any) {
            return formatDataSize(value)
          },
          font: {
            size: 12
          }
        },
        // Use the nice tick generation
        min: 0,
        max: maxValue * 1.1,
        afterBuildTicks: function(axis: any) {
          axis.ticks = generateNiceDataSizeTicks(maxValue).map(value => ({ value }))
        }
      }
    }
  }

  return (
    <div className="h-64 w-full">
      <Bar data={data} options={options} />
    </div>
  )
}