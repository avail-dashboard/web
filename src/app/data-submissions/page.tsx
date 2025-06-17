'use client'

import React, { useState, useEffect } from 'react'
import { DataSubmission, availAPI } from '@/lib/api'
import { formatTimeAgo } from '@/lib/utils'
import {
  Search,
  Filter,
  ExternalLink,
  Database,
  Clock,
  Hash,
  Activity,
  TrendingUp,
  FileText,
  Layers,
  BarChart3,
} from 'lucide-react'
import Link from 'next/link'
import { CopyableValue } from '@/components/ui/copyable-value'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Helper function to format data size
const formatDataSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Color palette for App IDs - Professional theme with good contrast and accessibility
const APP_ID_COLORS = [
  '#3B82F6', // Blue 500
  '#10B981', // Emerald 500  
  '#F59E0B', // Amber 500
  '#EF4444', // Red 500
  '#8B5CF6', // Violet 500
  '#06B6D4', // Cyan 500
  '#F97316', // Orange 500
  '#84CC16', // Lime 500
  '#EC4899', // Pink 500
  '#6366F1', // Indigo 500
  '#14B8A6', // Teal 500
  '#F59E0B', // Yellow 500
  '#8B5A2B', // Brown 600
  '#6B7280', // Gray 500
  '#7C3AED', // Purple 600
  '#059669', // Emerald 600
  '#DC2626', // Red 600
  '#2563EB', // Blue 600
  '#DB2777', // Pink 600
  '#16A34A'  // Green 600
]

// Get consistent color for App ID
const getAppIdColor = (appId: number): string => {
  return APP_ID_COLORS[appId % APP_ID_COLORS.length]
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

// Process submissions data for chart visualization
const processSubmissionsForChart = (submissions: DataSubmission[]): { chartData: ChartDataPoint[], appIds: number[] } => {
  if (!submissions || submissions.length === 0) return { chartData: [], appIds: [] }

  // Group submissions by block number and App ID, summing dataSize
  const groupedData: { [blockNumber: number]: { [appId: number]: number } } = {}
  const blockTimestamps: { [blockNumber: number]: string } = {}
  const appIds = new Set<number>()

  submissions.forEach(submission => {
    const blockNumber = submission.blockNumber
    
    if (!groupedData[blockNumber]) {
      groupedData[blockNumber] = {}
    }
    
    if (!groupedData[blockNumber][submission.appId]) {
      groupedData[blockNumber][submission.appId] = 0
    }
    
    // Sum dataSize instead of counting submissions
    groupedData[blockNumber][submission.appId] += submission.dataSize
    
    // Store timestamp for this block (use the first submission's timestamp)
    if (!blockTimestamps[blockNumber]) {
      blockTimestamps[blockNumber] = submission.timestamp
    }
    
    appIds.add(submission.appId)
  })

  // Get the range of block numbers
  const blockNumbers = Object.keys(groupedData).map(Number).sort((a, b) => a - b)
  if (blockNumbers.length === 0) return { chartData: [], appIds: [] }

  // Determine the range of blocks to show
  // If we have data from many blocks, show the range from first to last of the latest 50 blocks with data
  // If we have data from fewer blocks, show a wider range to include gaps
  const maxBlock = Math.max(...blockNumbers)
  const minBlock = blockNumbers.length >= 50 ? 
    blockNumbers[blockNumbers.length - 50] : // Last 50 blocks with data
    Math.max(maxBlock - 100, Math.min(...blockNumbers)) // Show up to 100 block range or from first block

  // Create continuous range of block numbers from min to max
  const chartData: ChartDataPoint[] = []
  for (let blockNumber = minBlock; blockNumber <= maxBlock; blockNumber++) {
    const dataPoint: ChartDataPoint = {
      blockNumber,
      timestamp: blockTimestamps[blockNumber] || '' // Use actual timestamp or empty string for blocks without data
    }
    
    // Add total data size for each App ID (or 0 if no data for this block)
    const sortedAppIds = Array.from(appIds).sort((a, b) => a - b)
    sortedAppIds.forEach(appId => {
      dataPoint[`app_${appId}`] = groupedData[blockNumber]?.[appId] || 0
    })
    
    chartData.push(dataPoint)
  }

  return { chartData, appIds: Array.from(appIds).sort((a, b) => a - b) }
}

// Types for custom tooltip
interface TooltipPayload {
  value: number
  dataKey: string
  color: string
  payload: ChartDataPoint
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string | number
}

// Custom tooltip component that only shows contributing App IDs
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    // Get timestamp from the first payload item
    const timestamp = payload[0]?.payload?.timestamp
    const formattedTime = timestamp ? formatTimeAgo(timestamp) : ''
    
    // Filter out entries with zero values
    const contributingApps = payload.filter((entry: TooltipPayload) => entry.value > 0)
    
    if (contributingApps.length === 0) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Block: ${label}`}</p>
          {formattedTime && <p className="text-xs text-muted-foreground mb-1">{formattedTime}</p>}
          <p className="text-sm text-muted-foreground">No data submissions</p>
        </div>
      )
    }
    
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-medium mb-1">{`Block: ${label}`}</p>
        {formattedTime && <p className="text-xs text-muted-foreground mb-2">{formattedTime}</p>}
        {contributingApps.map((entry: TooltipPayload, index: number) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                App ID {entry.dataKey.replace('app_', '')}
              </span>
            </div>
            <span className="text-sm font-medium">
              {formatDataSize(entry.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  
  return null
}

export default function DataSubmissionsPage() {
  const [submissions, setSubmissions] = useState<DataSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [appIdFilter, setAppIdFilter] = useState<string>('')
  const [submitterFilter, setSubmitterFilter] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [chartAppIds, setChartAppIds] = useState<number[]>([])

  // Stats state
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    totalDataSize: 0,
    uniqueApps: 0,
    averageSize: 0,
  })

  const limit = 82

  // Fetch data submissions
  const fetchSubmissions = async (
    pageNum: number = 1,
    reset: boolean = false
  ) => {
    try {
      setLoading(true)
      setError(null)

      const params: {
        page: number
        limit: number
        appId?: number
        submitter?: string
      } = {
        page: pageNum,
        limit,
      }

      if (appIdFilter) {
        params.appId = parseInt(appIdFilter)
      }
      if (submitterFilter) {
        params.submitter = submitterFilter
      }

      const response = await availAPI.getDataSubmissions(params.page, params.limit, params.appId, params.submitter)
      const dataSubmissions = response.dataSubmissions || []

      if (reset || pageNum === 1) {
        setSubmissions(dataSubmissions)
        // Process chart data only for first page/reset
        const { chartData: processedChartData, appIds } = processSubmissionsForChart(dataSubmissions)
        setChartData(processedChartData)
        setChartAppIds(appIds)
      } else {
        setSubmissions(prev => {
          const newSubmissions = [...prev, ...dataSubmissions]
          // Update chart data with all submissions for better visualization
          const { chartData: processedChartData, appIds } = processSubmissionsForChart(newSubmissions)
          setChartData(processedChartData)
          setChartAppIds(appIds)
          return newSubmissions
        })
      }

      setHasMore(dataSubmissions.length === limit)
      setPage(pageNum)
    } catch (err) {
      console.error('Failed to fetch data submissions:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to fetch data submissions'
      )
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const statsData = await availAPI.getDataSubmissionStats()
      setStats(statsData)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchSubmissions(1, true),
          fetchStats()
        ])
      } catch (err) {
        console.error('Failed to load initial data:', err)
        setError('Failed to load data. Please try again later.')
        setLoading(false)
      }
    }
    loadData()
  }, [appIdFilter, submitterFilter])

  // Helper function to get extrinsic ID from submission
  const getExtrinsicId = (submission: DataSubmission): string => {
    return `${submission.blockNumber}-${submission.extrinsicIndex}`
  }

  // Search functionality
  const filteredSubmissions = (submissions || []).filter(submission => {
    const extrinsicId = getExtrinsicId(submission)
    const matchesSearch =
      !searchTerm ||
      submission.dataHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.submitter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      extrinsicId.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchSubmissions(page + 1, false)
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setAppIdFilter('')
    setSubmitterFilter('')
    setPage(1)
  }

  if (loading && submissions.length === 0) {
    return (
      <div className="app-container py-8">
        <div className="flex items-center justify-center py-12">
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <span className="ml-4 text-muted-foreground">
            Loading data submissions...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Data Submissions</h1>
        <p className="text-muted-foreground">
          Explore data availability submissions on the Avail network
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Submissions
              </p>
              <p className="text-2xl font-bold">
                {(stats.totalSubmissions || 0).toLocaleString()}
              </p>
            </div>
            <Database className="h-8 w-8 text-avail-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Data Size
              </p>
              <p className="text-2xl font-bold">
                {formatDataSize(stats.totalDataSize || 0)}
              </p>
            </div>
            <Layers className="h-8 w-8 text-avail-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Unique Apps
              </p>
              <p className="text-2xl font-bold">{stats.uniqueApps || 0}</p>
            </div>
            <Activity className="h-8 w-8 text-avail-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Average Size
              </p>
              <p className="text-2xl font-bold">
                {formatDataSize(stats.averageSize || 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-avail-600" />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-card p-6 rounded-lg border shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-avail-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-avail-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Data Size by Block & App ID</h2>
              <p className="text-sm text-muted-foreground">
                Total data size per block, grouped by App ID (shows gaps for blocks without submissions)
              </p>
            </div>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="blockNumber" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  fontSize={12}
                  tickFormatter={(value) => formatDataSize(value)}
                  ticks={(() => {
                    // Calculate max value from chart data
                    const maxValue = Math.max(
                      ...chartData.map(dataPoint => 
                        chartAppIds.reduce((sum, appId) => {
                          const value = dataPoint[`app_${appId}`]
                          return sum + (typeof value === 'number' ? value : 0)
                        }, 0)
                      )
                    )
                    return generateNiceDataSizeTicks(maxValue)
                  })()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  formatter={(value) => `App ID ${value.replace('app_', '')}`}
                />
                {chartAppIds.map((appId) => (
                  <Bar
                    key={appId}
                    dataKey={`app_${appId}`}
                    stackId="submissions"
                    fill={getAppIdColor(appId)}
                    name={`app_${appId}`}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No data available for chart visualization</p>
              <p className="text-xs">Load more submissions to see chart data</p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card p-6 rounded-lg border shadow-sm mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by hash, submitter, or extrinsic..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-avail-600"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <input
              type="number"
              placeholder="App ID"
              value={appIdFilter}
              onChange={e => setAppIdFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-avail-600 w-24"
            />
          </div>

          <input
            type="text"
            placeholder="Submitter address"
            value={submitterFilter}
            onChange={e => setSubmitterFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-avail-600"
          />

          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80"
          >
            Reset
          </button>

          <div className="ml-auto text-sm text-muted-foreground">
            Showing {filteredSubmissions.length} of {submissions.length}{' '}
            submissions
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="text-red-600">⚠️</div>
            <div>
              <h3 className="font-medium text-red-800">Error Loading Data</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length > 0 ? (
          <>
            {filteredSubmissions.map((submission, index) => (
              <div key={`${submission.blockNumber}-${index}`} className="p-6">
                <div className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-avail-100 rounded-lg">
                          <FileText className="h-5 w-5 text-avail-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            Data Submission #{submission.extrinsicIndex}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            App ID: {submission.appId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            submission.success
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {submission.success ? 'Success' : 'Failed'}
                        </span>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(submission.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-muted-foreground">Size:</span>
                        <span className="font-mono">
                          {formatDataSize(submission.dataSize)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-muted-foreground">
                          Submitter:
                        </span>
                        <Link
                          href={`/accounts/${submission.submitter}`}
                          className="text-avail-600 hover:text-avail-700 flex items-center space-x-1"
                        >
                          <CopyableValue
                            value={submission.submitter}
                            truncate={true}
                            truncateStart={8}
                            truncateEnd={8}
                            valueClassName="text-avail-600"
                          />
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-muted-foreground">
                          Extrinsic:
                        </span>
                        <Link
                          href={`/extrinsics/${submission.extrinsicHash}`}
                          className="font-mono text-avail-600 hover:text-avail-700 flex items-center space-x-1"
                        >
                          <span>{getExtrinsicId(submission)}</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-muted-foreground">Block:</span>
                        <Link
                          href={`/blocks/${submission.blockNumber}`}
                          className="text-avail-600 hover:text-avail-700 flex items-center space-x-1"
                        >
                          <Hash className="h-3 w-3" />
                          <CopyableValue
                            value={submission.blockNumber.toString()}
                            displayValue={`#${submission.blockNumber}`}
                            monospace={true}
                            valueClassName="text-avail-600"
                          />
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-muted-foreground">
                          Data Hash:
                        </span>
                        <CopyableValue
                          value={submission.dataHash}
                          truncate={true}
                          truncateStart={10}
                          truncateEnd={10}
                          className="text-xs bg-muted px-2 py-1 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center py-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-avail-600 text-white rounded-lg hover:bg-avail-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No Data Submissions Found
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || appIdFilter || submitterFilter
                ? 'Try adjusting your filters to see more results.'
                : 'No data submissions have been made yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
