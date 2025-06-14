'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

import { extrinsicsApi } from '@/lib/api'
import { DataTable } from '@/components/ui/data-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExtrinsicsStatsCards } from '@/components/extrinsics/ExtrinsicsStatsCards'
import { ExtrinsicsFilters } from '@/components/extrinsics/ExtrinsicsFilters'
import { extrinsicTableColumns } from '@/components/extrinsics/extrinsicTableColumns'
import { calculateExtrinsicStats } from '@/lib/utils/extrinsicFormatters'

export default function ExtrinsicsPage() {
  const searchParams = useSearchParams()
  const blockParam = searchParams.get('block')

  // State for filters
  const [blockFilter, setBlockFilter] = React.useState<string>(blockParam || '')
  const [signerFilter, setSignerFilter] = React.useState<string>('')
  const [methodFilter, setMethodFilter] = React.useState<string>('all')
  const [successFilter, setSuccessFilter] = React.useState<string>('all')

  // Fetch extrinsics data
  const {
    data: extrinsics = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['extrinsics', blockFilter],
    queryFn: () =>
      extrinsicsApi.getExtrinsics({
        block: blockFilter ? Number(blockFilter) : undefined,
      }),
    refetchInterval: 15000, // Standardized to 15s
    staleTime: 5000,
  })

  // Fetch latest extrinsics for stats
  const { data: latestExtrinsics, isLoading: statsLoading } = useQuery({
    queryKey: ['extrinsics', 'latest'],
    queryFn: () => extrinsicsApi.getLatestExtrinsics(20),
    refetchInterval: 15000, // Standardized to 15s
  })

  // Calculate stats using utility function
  const stats = React.useMemo(() => {
    return calculateExtrinsicStats(latestExtrinsics || [])
  }, [latestExtrinsics])

  // Filter data based on current filters
  const filteredExtrinsics = React.useMemo(() => {
    let filtered = extrinsics

    if (signerFilter) {
      filtered = filtered.filter(ext =>
        ext.signer?.toLowerCase().includes(signerFilter.toLowerCase())
      )
    }

    if (methodFilter && methodFilter !== 'all') {
      filtered = filtered.filter(ext =>
        ext.module?.toLowerCase().includes(methodFilter.toLowerCase()) ||
        ext.call?.toLowerCase().includes(methodFilter.toLowerCase())
      )
    }

    if (successFilter !== 'all') {
      filtered = filtered.filter(ext =>
        ext.success === (successFilter === 'success')
      )
    }

    return filtered
  }, [extrinsics, signerFilter, methodFilter, successFilter])

  // Clear all filters
  const handleClearFilters = () => {
    setBlockFilter('')
    setSignerFilter('')
    setMethodFilter('all')
    setSuccessFilter('all')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Extrinsics</h1>
          <p className="text-muted-foreground">
            Browse and analyze all extrinsics on the Avail network
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <ExtrinsicsStatsCards stats={stats} isLoading={statsLoading} />

      {/* Filters */}
      <ExtrinsicsFilters
        blockFilter={blockFilter}
        setBlockFilter={setBlockFilter}
        signerFilter={signerFilter}
        setSignerFilter={setSignerFilter}
        methodFilter={methodFilter}
        setMethodFilter={setMethodFilter}
        successFilter={successFilter}
        setSuccessFilter={setSuccessFilter}
        onClearFilters={handleClearFilters}
      />

      {/* Extrinsics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Extrinsics</CardTitle>
          <CardDescription>
            {filteredExtrinsics && (
              <>Showing {filteredExtrinsics.length.toLocaleString()} extrinsics</>
            )}
            {filteredExtrinsics.length !== extrinsics.length && (
              <> (filtered from {extrinsics.length.toLocaleString()})</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={extrinsicTableColumns}
            data={filteredExtrinsics}
            loading={isLoading}
            searchable={false}
            filterable={false}
            pagination={{
              pageSize: 20,
              showSizeSelector: true,
            }}
            emptyMessage={
              error ? 'Failed to load extrinsics' : 'No extrinsics found'
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}