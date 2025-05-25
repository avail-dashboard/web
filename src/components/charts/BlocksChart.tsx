'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface BlocksChartProps {
  blocks: Array<{
    number: number
    time: number
    extrinsics: number
  }>
}

export function BlocksChart({ blocks }: BlocksChartProps) {
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
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Extrinsics Count',
        data: extrinsicsCounts,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: false,
        yAxisID: 'y1',
      },
    ],
  }

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
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          title: function (context: any) {
            const blockIndex = context[0].dataIndex
            const block = sortedBlocks[blockIndex]
            return `Block #${block.number}`
          },
          label: function (context: any) {
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
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Block Number',
        },
        ticks: {
          callback: function (value: any) {
            return '#' + value.toLocaleString()
          },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Extrinsics',
        },
        grid: {
          drawOnChartArea: false,
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
