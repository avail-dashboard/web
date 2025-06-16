'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Clock, Hash, CheckCircle, Filter } from 'lucide-react'
import Link from 'next/link'

import { blocksApi, Block } from '@/lib/api'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CopyableValue } from '@/components/ui/copyable-value'
import { formatTimeAgo } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Format block size
const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function BlocksPage() {
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(20)

  // Fetch blocks data
  const {
    data: blocks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['blocks', page, limit],
    queryFn: () =>
      blocksApi.getBlocks({
        page,
        limit,
      }),
    refetchInterval: 6000, // Refetch every 6 seconds for real-time updates
    staleTime: 3000,
  })

  // Fetch latest blocks for stats
  const { data: latestBlocks } = useQuery({
    queryKey: ['blocks', 'latest'],
    queryFn: () => blocksApi.getLatestBlocks(5),
    refetchInterval: 6000,
  })

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!latestBlocks || latestBlocks.length === 0) {
      return { averageBlockTime: 0, averageExtrinsics: 0, averageSize: 0 }
    }

    const blockTimes = []
    for (let i = 1; i < latestBlocks.length; i++) {
      const current = new Date(latestBlocks[i - 1].timestamp).getTime()
      const previous = new Date(latestBlocks[i].timestamp).getTime()
      blockTimes.push((current - previous) / 1000)
    }

    const averageBlockTime =
      blockTimes.length > 0
        ? blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length
        : 0

    const averageExtrinsics =
      latestBlocks.reduce(
        (sum, block) => sum + (block.extrinsicsCount ?? 0),
        0
      ) / latestBlocks.length
    const averageSize =
      latestBlocks.reduce((sum, block) => sum + (block.size || 0), 0) /
      latestBlocks.length

    return { averageBlockTime, averageExtrinsics, averageSize }
  }, [latestBlocks])

  // Define table columns
  const columns: ColumnDef<Block>[] = [
    {
      accessorKey: 'number',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          <Hash className="mr-2 h-4 w-4" />
          Block
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Link
          href={`/blocks/${row.original.number}`}
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          <CopyableValue
            value={row.original.number.toString()}
            displayValue={`#${row.original.number.toLocaleString()}`}
            monospace={true}
            valueClassName="text-blue-600"
          />
        </Link>
      ),
    },
    {
      accessorKey: 'timestamp',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          <Clock className="mr-2 h-4 w-4" />
          Age
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatTimeAgo(row.original.timestamp)}
        </span>
      ),
    },
    {
      accessorKey: 'extrinsics',
      header: 'Extrinsics',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {row.original.extrinsicsCount}
          </span>
          {row.original.extrinsicsCount > 0 && (
            <Link
              href={`/extrinsics?block=${row.original.number}`}
              className="text-xs text-blue-600 hover:underline"
            >
              View
            </Link>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'validator',
      header: 'Author',
      cell: ({ row }) => (
        <CopyableValue
          value={row.original.validator || 'Not available'}
          truncate={true}
          truncateStart={8}
          truncateEnd={8}
          className="text-sm"
        />
      ),
    },
    {
      accessorKey: 'size',
      header: 'Size',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.size ? formatSize(row.original.size) : 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'finalized',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={row.original.finalized ? 'success' : 'warning'}
          className="text-xs"
        >
          <CheckCircle className="mr-1 h-3 w-3" />
          {row.original.finalized ? 'Finalized' : 'Pending'}
        </Badge>
      ),
    },
    {
      accessorKey: 'hash',
      header: 'Hash',
      cell: ({ row }) => (
        <CopyableValue
          value={row.original.hash || 'Pending backend deployment'}
          truncate={true}
          truncateStart={10}
          truncateEnd={8}
          className="text-xs bg-muted px-2 py-1 rounded"
          valueClassName={row.original.hash ? '' : 'text-muted-foreground'}
        />
      ),
    },
  ]

  return (
    <div className="app-container py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blocks</h1>
          <p className="text-muted-foreground">
            Browse and search all blocks on the Avail network
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Block Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageBlockTime.toFixed(1)}s
            </div>
            <p className="text-xs text-muted-foreground">
              Based on last 5 blocks
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Extrinsics
            </CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageExtrinsics.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Per block average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Size</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatSize(stats.averageSize)}
            </div>
            <p className="text-xs text-muted-foreground">Block size average</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Settings</CardTitle>
          <CardDescription>Configure the blocks display</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Per Page</label>
              <Select
                value={limit.toString()}
                onValueChange={(value: string) => setLimit(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocks Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Blocks</CardTitle>
          <CardDescription>Showing {blocks.length} blocks</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={blocks || []}
            loading={isLoading}
            searchable={false}
            filterable={true}
            pagination={{
              pageSize: limit,
              showSizeSelector: false,
            }}
            emptyMessage={error ? 'Failed to load blocks' : 'No blocks found'}
          />

          {/* Custom Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">Page {page}</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => prev + 1)}
                disabled={blocks.length < limit}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
