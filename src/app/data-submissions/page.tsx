'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { availAPI } from '@/lib/api'
import type { DataSubmission } from '@/lib/api'
import { formatTimeAgo } from '@/lib/utils'
import { RefreshIndicator } from '@/components/ui/RefreshIndicator'
import Link from 'next/link'
import {
  Filter,
  RefreshCw,
  Database,
  FileText,
  Users,
  HardDrive,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'

// Add missing interface
interface DataSubmissionStats {
  totalSubmissions: number
  totalDataSize: number // in bytes
  uniqueApps: number
  uniqueSubmitters: number
  averageSize: number
  submissionsToday: number
  dataSizeToday: number
}

export default function DataSubmissionsPage() {
  const [submissions, setSubmissions] = useState<DataSubmission[]>([])
  const [stats, setStats] = useState<DataSubmissionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialLoad, setInitialLoad] = useState(true)

  // Filters
  const [appIdFilter, setAppIdFilter] = useState<string>('')
  const [submitterFilter, setSubmitterFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage] = useState(20)

  // UI state
  const [showFilters, setShowFilters] = useState(false)

  const fetchData = useCallback(
    async (isManualRefetch = false) => {
      try {
        console.log('🔄 fetchData: Starting data fetch...')

        // Show loading for initial load or manual refresh, refreshing for background updates
        if (initialLoad || isManualRefetch) {
          setLoading(true)
        } else {
          setRefreshing(true)
        }
        setError(null)

        console.log('📡 fetchData: Making API calls...')
        const [submissionsResult, statsResult] = await Promise.allSettled([
          availAPI.getDataSubmissions(
            currentPage,
            itemsPerPage,
            appIdFilter ? parseInt(appIdFilter) : undefined,
            submitterFilter || undefined
          ),
          availAPI.getDataSubmissionStats(),
        ])

        console.log('✅ fetchData: API calls completed')

        // Only update data on successful responses
        if (submissionsResult.status === 'fulfilled') {
          setSubmissions(submissionsResult.value)
          console.log(
            '✅ Submissions data updated:',
            submissionsResult.value.length
          )
        } else {
          console.error('❌ Submissions API failed:', submissionsResult.reason)
        }

        if (statsResult.status === 'fulfilled') {
          setStats(statsResult.value)
          console.log('✅ Stats data updated')
        } else {
          console.error('❌ Stats API failed:', statsResult.reason)
        }

        // Set error only if both calls failed
        if (
          submissionsResult.status === 'rejected' &&
          statsResult.status === 'rejected'
        ) {
          setError(
            'Failed to fetch data submissions. The backend service may be experiencing issues.'
          )
        } else if (submissionsResult.status === 'rejected') {
          setError('Failed to fetch submissions data.')
        } else if (statsResult.status === 'rejected') {
          setError('Failed to fetch statistics.')
        }

        setInitialLoad(false)
        console.log('✅ fetchData: State updated successfully')
      } catch (err) {
        console.error('❌ fetchData: Unexpected error:', err)
        setError('An unexpected error occurred.')
        setInitialLoad(false)
      } finally {
        console.log('🏁 fetchData: Setting loading to false')
        setLoading(false)
        setRefreshing(false)
      }
    },
    [currentPage, itemsPerPage, appIdFilter, submitterFilter, initialLoad]
  )

  useEffect(() => {
    fetchData(false)
  }, [fetchData])

  // Set up automatic refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      // Only auto-refresh if not currently loading and no filters are applied
      if (!loading && !refreshing && !appIdFilter && !submitterFilter) {
        fetchData(false)
      }
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [loading, refreshing, appIdFilter, submitterFilter, fetchData])

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(0) // Reset to first page when filtering
    fetchData(true) // Manual refetch
  }

  const handleRefresh = () => {
    fetchData(true) // Manual refetch
  }

  const clearFilters = () => {
    setAppIdFilter('')
    setSubmitterFilter('')
    setCurrentPage(0)
  }

  const formatDataSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getAppIdColor = (appId: number): string => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ]
    return colors[appId % colors.length]
  }

  if (initialLoad && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="mt-4 text-muted-foreground">
            Loading data submissions...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Data Submissions</h1>
          <p className="text-muted-foreground mt-2">
            Browse data availability submissions on the Avail network
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {error && (
            <div className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
              {error}
            </div>
          )}
          <RefreshIndicator isRefreshing={refreshing} />
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="text-xs bg-avail-600 text-white px-3 py-1 rounded hover:bg-avail-700 disabled:opacity-50 flex items-center space-x-1"
          >
            <RefreshCw className="h-3 w-3" />
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Submissions
                </p>
                <p className="text-2xl font-bold text-avail-600">
                  {stats.totalSubmissions.toLocaleString()}
                </p>
              </div>
              <Database className="h-8 w-8 text-avail-600" />
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Data Size</p>
                <p className="text-2xl font-bold text-avail-600">
                  {formatDataSize(stats.totalDataSize)}
                </p>
              </div>
              <HardDrive className="h-8 w-8 text-avail-600" />
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique Apps</p>
                <p className="text-2xl font-bold text-avail-600">
                  {stats.uniqueApps}
                </p>
              </div>
              <FileText className="h-8 w-8 text-avail-600" />
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Unique Submitters
                </p>
                <p className="text-2xl font-bold text-avail-600">
                  {stats.uniqueSubmitters}
                </p>
              </div>
              <Users className="h-8 w-8 text-avail-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card p-6 rounded-lg border shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-avail-600 hover:text-avail-700"
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>

        {showFilters && (
          <form onSubmit={handleFilterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">App ID</label>
                <input
                  type="number"
                  value={appIdFilter}
                  onChange={e => setAppIdFilter(e.target.value)}
                  placeholder="Filter by App ID"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-avail-600/20 focus:border-avail-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Submitter Address
                </label>
                <input
                  type="text"
                  value={submitterFilter}
                  onChange={e => setSubmitterFilter(e.target.value)}
                  placeholder="Filter by submitter address"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-avail-600/20 focus:border-avail-600"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-avail-600 text-white px-4 py-2 rounded hover:bg-avail-700 disabled:opacity-50"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Clear Filters
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Data Submissions List */}
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Data Submissions</h2>
          <p className="text-sm text-muted-foreground">
            {submissions.length > 0
              ? `Showing ${submissions.length} submissions`
              : 'No submissions found'}
          </p>
        </div>

        {submissions.length > 0 ? (
          <div className="divide-y">
            {submissions.map((submission, index) => (
              <div key={`${submission.blockNumber}-${index}`} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getAppIdColor(submission.appId)}`}
                      >
                        App {submission.appId}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Block #{submission.blockNumber}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-muted-foreground">Size:</span>
                        <span className="font-mono">
                          {formatDataSize(submission.size)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-muted-foreground">
                          Submitter:
                        </span>
                        <Link
                          href={`/accounts/${submission.submitter}`}
                          className="font-mono text-avail-600 hover:text-avail-700 flex items-center space-x-1"
                        >
                          <span>
                            {submission.submitter.slice(0, 8)}...
                            {submission.submitter.slice(-8)}
                          </span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>

                      {submission.extrinsicId && (
                        <div className="flex items-center space-x-4">
                          <span className="text-muted-foreground">
                            Extrinsic:
                          </span>
                          <Link
                            href={`/extrinsics/${submission.extrinsicId.split('-')[0]}`}
                            className="font-mono text-avail-600 hover:text-avail-700 flex items-center space-x-1"
                          >
                            <span>{submission.extrinsicId}</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right text-sm text-muted-foreground">
                    <div>{formatTimeAgo(submission.timestamp)}</div>
                    <div className="text-xs">
                      {new Date(submission.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="loading-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                <span className="ml-4">Loading submissions...</span>
              </div>
            ) : error ? (
              <div>
                <p className="text-red-500 mb-2">Failed to load submissions</p>
                <button
                  onClick={handleRefresh}
                  className="text-avail-600 hover:text-avail-700"
                >
                  Try again
                </button>
              </div>
            ) : (
              <div>
                <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No data submissions found</p>
                {(appIdFilter || submitterFilter) && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-avail-600 hover:text-avail-700"
                  >
                    Clear filters to see all submissions
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {submissions.length > 0 && (
          <div className="p-6 border-t flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {currentPage + 1}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0 || loading}
                className="flex items-center space-x-1 px-3 py-1 border rounded hover:bg-muted disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={submissions.length < itemsPerPage || loading}
                className="flex items-center space-x-1 px-3 py-1 border rounded hover:bg-muted disabled:opacity-50"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
