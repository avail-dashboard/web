'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import {
  ArrowUpDown,
  Clock,
  Hash,
  User,
  CheckCircle,
  XCircle,
  Filter,
  Activity,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { extrinsicsApi, Extrinsic } from '@/lib/api'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Input } from '@/components/ui/input'

// Format timestamp to relative time
const formatTimeAgo = (timestamp: string | number) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

// Format fee amount
const formatFee = (fee: string | number) => {
  const feeNum = typeof fee === 'string' ? parseFloat(fee) : fee
  if (feeNum === 0) return '0'
  return (feeNum / 1e18).toFixed(6)
}

// Get color for method section
const getMethodColor = (module: string) => {
  const colors: Record<string, string> = {
    timestamp: 'bg-blue-100 text-blue-800',
    balances: 'bg-green-100 text-green-800',
    system: 'bg-gray-100 text-gray-800',
    staking: 'bg-purple-100 text-purple-800',
    dataAvailability: 'bg-orange-100 text-orange-800',
    vector: 'bg-red-100 text-red-800',
  }
  return colors[module] || 'bg-gray-100 text-gray-800'
}

export default function ExtrinsicsPage() {
  const searchParams = useSearchParams()
  const blockParam = searchParams.get('block')

  // Remove pagination state - we now load all extrinsics
  const [blockFilter, setBlockFilter] = React.useState<string>(blockParam || '')
  const [signerFilter, setSignerFilter] = React.useState<string>('')
  const [methodFilter, setMethodFilter] = React.useState<string>('')
  const [successFilter, setSuccessFilter] = React.useState<string>('all')

  // Fetch all extrinsics data without pagination
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
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000,
  })

  // Fetch latest extrinsics for stats
  const { data: latestExtrinsics } = useQuery({
    queryKey: ['extrinsics', 'latest'],
    queryFn: () => extrinsicsApi.getLatestExtrinsics(20),
    refetchInterval: 10000,
  })

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!latestExtrinsics || latestExtrinsics.length === 0) {
      return {
        successRate: 0,
        averageFee: 0,
        uniqueMethods: 0,
        methodBreakdown: {},
      }
    }

    const successful = latestExtrinsics.filter(ext => ext.success).length
    const successRate = (successful / latestExtrinsics.length) * 100

    const totalFees = latestExtrinsics.reduce((sum, ext) => {
      if (ext.fee !== undefined && ext.fee !== null) {
        return (
          sum + (typeof ext.fee === 'string' ? parseFloat(ext.fee) : ext.fee)
        )
      }
      return sum
    }, 0)
    const averageFee = totalFees / latestExtrinsics.length

    const methods = new Set(
      latestExtrinsics
        .filter(ext => ext.module && ext.call)
        .map(ext => `${ext.module}.${ext.call}`)
    )
    const uniqueMethods = methods.size

    const methodBreakdown = latestExtrinsics.reduce(
      (acc, ext) => {
        const key = ext.module
        if (key) {
          acc[key] = (acc[key] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>
    )

    return { successRate, averageFee, uniqueMethods, methodBreakdown }
  }, [latestExtrinsics])

  // Define table columns
  const columns: ColumnDef<Extrinsic>[] = [
    {
      accessorKey: 'hash',
      header: 'Hash',
      cell: ({ row }) => (
        <Link
          href={`/extrinsics/${row.original.hash || ''}`}
          className="font-mono text-blue-600 hover:text-blue-800 hover:underline text-sm"
        >
          {row.original.hash
            ? `${row.original.hash.slice(0, 10)}...${row.original.hash.slice(-10)}`
            : 'Hash not available'}
        </Link>
      ),
    },
    {
      accessorKey: 'blockNumber',
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
          href={`/blocks/${row.original.blockNumber || 0}`}
          className="font-mono text-blue-600 hover:underline"
        >
          #{row.original.blockNumber?.toLocaleString() || 'N/A'}
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
      accessorKey: 'method',
      header: 'Method',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge
            className={`text-xs ${getMethodColor(row.original.module || '')}`}
            variant="secondary"
          >
            {row.original.module || 'Unknown'}
          </Badge>
          <span className="font-mono text-sm">
            {row.original.call || 'Unknown'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'signer',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          <User className="mr-2 h-4 w-4" />
          Signer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Link
          href={`/accounts/${row.original.signer || ''}`}
          className="font-mono text-sm text-blue-600 hover:underline"
        >
          {row.original.signer
            ? `${row.original.signer.slice(0, 8)}...${row.original.signer.slice(-8)}`
            : 'Signer not available'}
        </Link>
      ),
    },
    {
      accessorKey: 'fee',
      header: 'Fee',
      cell: ({ row }) => (
        <span className="text-sm font-mono">
          {row.original.fee !== undefined && row.original.fee !== null
            ? formatFee(row.original.fee)
            : '0'}{' '}
          AVAIL
        </span>
      ),
    },
    {
      accessorKey: 'success',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={row.original.success ? 'success' : 'destructive'}
          className="text-xs"
        >
          {row.original.success ? (
            <CheckCircle className="mr-1 h-3 w-3" />
          ) : (
            <XCircle className="mr-1 h-3 w-3" />
          )}
          {row.original.success ? 'Success' : 'Failed'}
        </Badge>
      ),
    },
    {
      accessorKey: 'events',
      header: 'Events',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.events?.length || 0}
        </span>
      ),
    },
  ]

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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Last 20 extrinsics</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Fee</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFee(stats.averageFee.toString())}
            </div>
            <p className="text-xs text-muted-foreground">AVAIL per extrinsic</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unique Methods
            </CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueMethods}</div>
            <p className="text-xs text-muted-foreground">
              Different call types
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Section</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(stats.methodBreakdown).sort(
                ([, a], [, b]) => b - a
              )[0]?.[0] || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Most active section</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>
            Filter extrinsics by block, signer, method, or success status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Block Number
              </label>
              <Input
                placeholder="Enter block number..."
                value={blockFilter}
                onChange={e => setBlockFilter(e.target.value)}
                type="number"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Signer</label>
              <Input
                placeholder="Enter signer address..."
                value={signerFilter}
                onChange={e => setSignerFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Method</label>
              <Input
                placeholder="e.g. transfer, submit_data..."
                value={methodFilter}
                onChange={e => setMethodFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={successFilter} onValueChange={setSuccessFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="true">Success only</SelectItem>
                  <SelectItem value="false">Failed only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extrinsics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Extrinsics</CardTitle>
          <CardDescription>
            {extrinsics && (
              <>Showing all {extrinsics.length.toLocaleString()} extrinsics</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={extrinsics || []}
            loading={isLoading}
            searchable={false}
            filterable={true}
            pagination={{
              pageSize: 20,
              showSizeSelector: false,
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
