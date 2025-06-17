'use client'

import { Doughnut } from 'react-chartjs-2'
import { ChartOptions } from 'chart.js'
import { createBaseChartOptions, ChartJS } from '@/lib/chart-config'

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
  // Create labels with both amounts and percentages
  const labelsWithAmounts = [
    `Circulating: ${data.circulating?.amount || '0'} (${(data.circulating?.percentage || 0).toFixed(2)}%)`,
    `Staking: ${data.staking?.amount || '0'} (${(data.staking?.percentage || 0).toFixed(2)}%)`,
    `Treasury: ${data.treasury?.amount || '0'} (${(data.treasury?.percentage || 0).toFixed(2)}%)`,
    `Others: ${data.others?.amount || '0'} (${(data.others?.percentage || 0).toFixed(2)}%)`,
  ]

  const chartData = {
    labels: labelsWithAmounts,
    datasets: [
      {
        data: [
          data.circulating?.percentage || 0,
          data.staking?.percentage || 0,
          data.treasury?.percentage || 0,
          data.others?.percentage || 0,
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

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 11,
          },
          // Custom label generation to handle long text
          generateLabels: function (chart: ChartJS) {
            const data = chart.data
            if (data.labels?.length && data.datasets.length) {
              return (data.labels as string[]).map(
                (label: string, i: number) => {
                  const dataset = data.datasets[0]
                  // Safely access backgroundColor and borderColor as arrays
                  const backgroundColor = Array.isArray(dataset.backgroundColor)
                    ? dataset.backgroundColor[i]
                    : dataset.backgroundColor
                  const borderColor = Array.isArray(dataset.borderColor)
                    ? dataset.borderColor[i]
                    : dataset.borderColor

                  return {
                    text: label,
                    fillStyle: backgroundColor,
                    strokeStyle: borderColor,
                    lineWidth:
                      typeof dataset.borderWidth === 'number'
                        ? dataset.borderWidth
                        : 2,
                    pointStyle: 'circle' as const,
                    hidden: false,
                    index: i,
                  }
                }
              )
            }
            return []
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: { dataIndex: number; label: string }) {
            const dataIndex = context.dataIndex
            const categories = [
              'circulating',
              'staking',
              'treasury',
              'others',
            ] as const
            const category = categories[dataIndex]
            const categoryData = data[category]

            return `${context.label.split(':')[0]}: ${categoryData.amount} (${categoryData.percentage.toFixed(2)}%)`
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
