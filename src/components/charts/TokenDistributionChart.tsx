'use client'

import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title)

interface TokenDistributionProps {
  data: {
    circulating: { amount: string; percentage: number }
    staking: { amount: string; percentage: number }
    treasury: { amount: string; percentage: number }
    others: { amount: string; percentage: number }
  }
  totalIssuance: string
}

export function TokenDistributionChart({
  data,
  totalIssuance,
}: TokenDistributionProps) {
  const chartData = {
    labels: ['Circulating', 'Staking', 'Treasury', 'Others'],
    datasets: [
      {
        data: [
          data.circulating.percentage,
          data.staking.percentage,
          data.treasury.percentage,
          data.others.percentage,
        ],
        backgroundColor: [
          '#3B82F6', // Blue for circulating
          '#10B981', // Green for staking
          '#F59E0B', // Yellow for treasury
          '#6B7280', // Gray for others
        ],
        borderColor: ['#2563EB', '#059669', '#D97706', '#4B5563'],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || ''
            const value = context.parsed
            return `${label}: ${value.toFixed(2)}%`
          },
        },
      },
      title: {
        display: true,
        text: `Total Issuance: ${totalIssuance}`,
        font: {
          size: 14,
          weight: 'bold' as const,
        },
        padding: {
          bottom: 20,
        },
      },
    },
    cutout: '60%',
    animation: {
      animateRotate: true,
      duration: 1000,
    },
  }

  return (
    <div className="w-full h-80">
      <Doughnut data={chartData} options={options} />
    </div>
  )
}
