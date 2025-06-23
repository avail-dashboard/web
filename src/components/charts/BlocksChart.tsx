'use client'

import { Line } from 'react-chartjs-2'
// Import chart configuration to ensure Chart.js components are registered
import '@/lib/chart-config'
import { useTheme } from '@/contexts/ThemeContext'
import { getChartColorPalette, getThemeColors } from '@/lib/chart-themes'

interface BlocksChartProps {
  blocks: Array<{
    number: number
    time: number
    extrinsics: number
  }>
}

export function BlocksChart({ blocks }: BlocksChartProps) {
  const { actualTheme } = useTheme()
  const colors = getChartColorPalette(actualTheme, 2)

  // Generate time labels and block data
  const sortedBlocks = [...blocks].sort((a, b) => a.number - b.number)

  const labels = sortedBlocks.map(block => {
    const date = new Date(block.time)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  })

  const blockNumbers = sortedBlocks.map(block => block.number)
  const extrinsicsCounts = sortedBlocks.map(block => block.extrinsics)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Block Number',
        data: blockNumbers,
        borderColor: colors[0],
        backgroundColor: colors[0] + '1A', // 10% opacity
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Extrinsics Count',
        data: extrinsicsCounts,
        borderColor: colors[1],
        backgroundColor: colors[1] + '1A', // 10% opacity
        tension: 0.4,
        fill: false,
        yAxisID: 'y1',
      },
    ],
  }

  const themeColors = getThemeColors(actualTheme)
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Recent Block Activity',
        color: themeColors.foreground,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      legend: {
        position: 'top' as const,
        labels: {
          color: themeColors.foreground,
          font: {
            size: 11,
          },
          padding: 20,
          usePointStyle: true,
        },
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
          title: function (context: unknown[]) {
            const ctx = context[0] as { dataIndex: number }
            const blockIndex = ctx.dataIndex
            const block = sortedBlocks[blockIndex]
            return `Block #${block.number}`
          },
          label: function (context: { dataset: { label?: string }, parsed: { y: number } }) {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            if (label === 'Block Number') {
              return `${label}: #${value.toLocaleString()}`
            }
            return `${label}: ${value}`
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
          color: themeColors.foreground,
        },
        ticks: {
          color: themeColors.foreground,
        },
        grid: {
          color: themeColors.grid,
        },
        border: {
          color: themeColors.border,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Block Number',
          color: themeColors.foreground,
        },
        ticks: {
          color: themeColors.foreground,
          callback: function (value: number | string) {
            return '#' + Number(value).toLocaleString()
          },
        },
        grid: {
          color: themeColors.grid,
        },
        border: {
          color: themeColors.border,
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Extrinsics',
          color: themeColors.foreground,
        },
        ticks: {
          color: themeColors.foreground,
        },
        grid: {
          drawOnChartArea: false,
          color: themeColors.grid,
        },
        border: {
          color: themeColors.border,
        },
      },
    },
  }

  return (
    <div className="w-full h-80">
      <Line data={chartData} options={options} />
    </div>
  )
}
