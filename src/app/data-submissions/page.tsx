'use client'

import React, { useState, useEffect } from 'react'
import { DataSubmission, availAPI } from '@/lib/api'
import { formatTimeAgo } from '@/lib/utils'
import {
  Database,
  Activity,
  TrendingUp,
  Layers,
  BarChart3,
} from 'lucide-react'
import Link from 'next/link'
import { CopyableValue } from '@/components/ui/copyable-value'
import { DataSubmissionsChart } from '@/components/charts/DataSubmissionsChart'
import { EnhancedDataSubmissionsChart } from '@/components/charts/EnhancedDataSubmissionsChart'

// Helper function to format data size
const formatDataSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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


export default function DataSubmissionsPage() {
  const [submissions, setSubmissions] = useState<DataSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

      const response = await availAPI.getDataSubmissions(pageNum, limit)
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
  }, [])



  const loadMore = () => {
    if (!loading && hasMore) {
      fetchSubmissions(page + 1, false)
    }
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

      {/* Enhanced Chart Section */}
      <div className="bg-card p-6 rounded-lg border shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-avail-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-avail-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Data Availability Analytics</h2>
              <p className="text-sm text-muted-foreground">
                Interactive charts with time range and metric selection
              </p>
            </div>
          </div>
        </div>

        <EnhancedDataSubmissionsChart className="mb-8" />
        
        {/* Legacy Chart - Keep for comparison during transition */}
        <div className="border-t pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <h3 className="text-md font-medium text-muted-foreground">Legacy View</h3>
            <span className="text-xs bg-muted px-2 py-1 rounded">Block-based</span>
          </div>
          <DataSubmissionsChart chartData={chartData} appIds={chartAppIds} />
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

      {/* Two-Column Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Data Submissions Table */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Data Submissions</h2>
            <div className="text-sm text-muted-foreground">
              {submissions.length} submissions
            </div>
          </div>
          <div className="bg-card rounded-lg border shadow-sm">
            {submissions.length > 0 ? (
              <>
                {/* Table Header */}
                <div className="px-6 py-4 border-b bg-muted/50">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                    <div className="col-span-2">App ID</div>
                    <div className="col-span-2">Index</div>
                    <div className="col-span-2">Size</div>
                    <div className="col-span-3">Submitter</div>
                    <div className="col-span-2">Time</div>
                    <div className="col-span-1">Status</div>
                  </div>
                </div>
                
                {/* Table Body - Scrollable */}
                <div className="max-h-96 overflow-y-auto">
                  {submissions.map((submission, index) => (
                    <div
                      key={`${submission.blockNumber}-${index}`}
                      className="px-6 py-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                      <div className="grid grid-cols-12 gap-4 items-center text-sm">
                        <div className="col-span-2">
                          <span className="font-medium text-avail-600">
                            {submission.appId}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <Link
                            href={`/extrinsics/${submission.extrinsicHash}`}
                            className="text-avail-600 hover:text-avail-700"
                          >
                            #{submission.extrinsicIndex}
                          </Link>
                        </div>
                        <div className="col-span-2">
                          <span className="font-mono text-xs">
                            {formatDataSize(submission.dataSize)}
                          </span>
                        </div>
                        <div className="col-span-3">
                          <Link
                            href={`/accounts/${submission.submitter}`}
                            className="text-avail-600 hover:text-avail-700"
                          >
                            <CopyableValue
                              value={submission.submitter}
                              truncate={true}
                              truncateStart={6}
                              truncateEnd={6}
                              valueClassName="text-avail-600 text-xs"
                            />
                          </Link>
                        </div>
                        <div className="col-span-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(submission.timestamp)}
                          </span>
                        </div>
                        <div className="col-span-1">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              submission.success
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {submission.success ? '✓' : '✗'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="p-4 border-t bg-muted/30">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-avail-600 text-white rounded-lg hover:bg-avail-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No Data Submissions Found
                </h3>
                <p className="text-muted-foreground">
                  No data submissions have been made yet.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Future Charts Placeholder */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Additional Analytics</h2>
            <div className="text-sm text-muted-foreground">
              Coming soon
            </div>
          </div>
          <div className="space-y-6">
            {/* Placeholder for future chart 1 */}
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">App Distribution Chart</h3>
                  <p className="text-sm">
                    Visualization of submissions by App ID
                  </p>
                </div>
              </div>
            </div>

            {/* Placeholder for future chart 2 */}
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">Submission Trends</h3>
                  <p className="text-sm">
                    Historical trends and patterns
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
