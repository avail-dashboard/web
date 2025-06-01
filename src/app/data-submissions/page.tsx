'use client'

import React, { useState, useEffect } from 'react'
import { availAPI } from '@/lib/api'
import type { DataSubmission } from '@/lib/api'
import { formatTimeAgo } from '@/lib/utils'
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
  const [error, setError] = useState<string | null>(null)
  const [initialLoad, setInitialLoad] = useState(true)

  // Filters
  const [appIdFilter, setAppIdFilter] = useState<string>('')
  const [submitterFilter, setSubmitterFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage] = useState(20)

  // UI state
  const [showFilters, setShowFilters] = useState(false)

  const fetchData = async () => {
    try {
      console.log('🔄 fetchData: Starting data fetch...')
      setLoading(true)
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
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentPage, appIdFilter, submitterFilter])

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(0) // Reset to first page when filtering
    fetchData()
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold text-avail-600">
              Avail Explorer
            </Link>
            <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>Data Submissions</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-avail-600 text-white rounded hover:bg-avail-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Error Banner - shows without clearing data */}
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {error}
                <button
                  onClick={fetchData}
                  className="ml-2 text-yellow-800 underline hover:text-yellow-900"
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        {stats && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Submissions
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.totalSubmissions.toLocaleString()}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Data Size
                    </p>
                    <p className="text-2xl font-bold">
                      {formatDataSize(stats.totalDataSize)}
                    </p>
                  </div>
                  <HardDrive className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unique Apps</p>
                    <p className="text-2xl font-bold">{stats.uniqueApps}</p>
                  </div>
                  <Database className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Unique Submitters
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.uniqueSubmitters}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Filters */}
        <section className="mb-6">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Filter className="h-4 w-4" />
                <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
              </button>
            </div>

            {showFilters && (
              <form onSubmit={handleFilterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="appId"
                      className="block text-sm font-medium mb-2"
                    >
                      App ID
                    </label>
                    <input
                      id="appId"
                      type="number"
                      value={appIdFilter}
                      onChange={e => setAppIdFilter(e.target.value)}
                      placeholder="Filter by App ID"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-avail-600"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="submitter"
                      className="block text-sm font-medium mb-2"
                    >
                      Submitter Address
                    </label>
                    <input
                      id="submitter"
                      type="text"
                      value={submitterFilter}
                      onChange={e => setSubmitterFilter(e.target.value)}
                      placeholder="Filter by submitter address"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-avail-600"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-avail-600 text-white rounded hover:bg-avail-700 disabled:opacity-50"
                  >
                    Apply Filters
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Data Submissions Table */}
        <section>
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Data Submissions</h2>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Showing {submissions.length} submissions</span>
                </div>
              </div>
            </div>

            {submissions.length === 0 && !loading && !initialLoad ? (
              <div className="p-6 text-center">
                <div className="text-muted-foreground text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold mb-2">
                  No Data Submissions Found
                </h3>
                <p className="text-muted-foreground">
                  No data submissions match your current filters.
                </p>
              </div>
            ) : submissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Extrinsic ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        App ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Submitter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Data Hash
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {submissions.map(submission => (
                      <tr
                        key={submission.extrinsicId}
                        className="hover:bg-muted/50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/extrinsics/${submission.extrinsicId.split('-')[0]}`}
                            className="text-avail-600 hover:text-avail-700 font-mono text-sm flex items-center space-x-1"
                          >
                            <span>{submission.extrinsicId}</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getAppIdColor(submission.appId)}`}
                          >
                            {submission.appId}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatDataSize(submission.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/accounts/${submission.submitter}`}
                            className="text-avail-600 hover:text-avail-700 font-mono text-sm"
                          >
                            {submission.submitter.slice(0, 8)}...
                            {submission.submitter.slice(-8)}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm text-muted-foreground">
                            {submission.dataHash.slice(0, 10)}...
                            {submission.dataHash.slice(-8)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatTimeAgo(submission.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {/* Pagination */}
            {submissions.length > 0 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage + 1}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0 || loading}
                    className="flex items-center space-x-1 px-3 py-2 border rounded hover:bg-muted disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={submissions.length < itemsPerPage || loading}
                    className="flex items-center space-x-1 px-3 py-2 border rounded hover:bg-muted disabled:opacity-50"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
