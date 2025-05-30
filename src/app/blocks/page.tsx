"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Clock, Hash, User, CheckCircle, XCircle, Filter } from "lucide-react"
import Link from "next/link"

import { blocksApi, Block } from "@/lib/api"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

// Format timestamp to relative time
const formatTimeAgo = (timestamp: string) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

// Format block size
const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function BlocksPage() {
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(20)
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [validatorFilter, setValidatorFilter] = React.useState<string>("")

  // Fetch blocks data
  const { data: blocksData, isLoading, error } = useQuery({
    queryKey: ['blocks', page, limit, statusFilter, validatorFilter],
    queryFn: () => blocksApi.getBlocks({
      page,
      limit,
      status: statusFilter === "all" ? undefined : statusFilter || undefined,
      validator: validatorFilter || undefined,
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
      const current = new Date(latestBlocks[i-1].timestamp).getTime()
      const previous = new Date(latestBlocks[i].timestamp).getTime()
      blockTimes.push((current - previous) / 1000)
    }

    const averageBlockTime = blockTimes.length > 0 
      ? blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length 
      : 0

    const averageExtrinsics = latestBlocks.reduce((sum, block) => sum + block.extrinsicsCount, 0) / latestBlocks.length
    const averageSize = latestBlocks.reduce((sum, block) => sum + block.size, 0) / latestBlocks.length

    return { averageBlockTime, averageExtrinsics, averageSize }
  }, [latestBlocks])

  // Define table columns
  const columns: ColumnDef<Block>[] = [
    {
      accessorKey: "number",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
          className="font-mono text-blue-600 hover:text-blue-800 hover:underline"
        >
          #{row.original.number.toLocaleString()}
        </Link>
      ),
    },
    {
      accessorKey: "timestamp",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
      accessorKey: "extrinsicsCount",
      header: "Extrinsics",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.extrinsicsCount}</span>
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
      accessorKey: "validator",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          <User className="mr-2 h-4 w-4" />
          Validator
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Link 
          href={`/validators/${row.original.validator}`}
          className="font-mono text-sm text-blue-600 hover:underline"
        >
          {row.original.validator.slice(0, 8)}...{row.original.validator.slice(-8)}
        </Link>
      ),
    },
    {
      accessorKey: "size",
      header: "Size",
      cell: ({ row }) => (
        <span className="text-sm">{formatSize(row.original.size)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge 
          variant={row.original.status === 'finalized' ? 'success' : 'warning'}
          className="text-xs"
        >
          {row.original.status === 'finalized' ? (
            <CheckCircle className="mr-1 h-3 w-3" />
          ) : (
            <XCircle className="mr-1 h-3 w-3" />
          )}
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "hash",
      header: "Hash",
      cell: ({ row }) => (
        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
          {row.original.hash.slice(0, 10)}...{row.original.hash.slice(-10)}
        </code>
      ),
    },
  ]

  return (
    <div className="container mx-auto py-6 space-y-6">
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
            <CardTitle className="text-sm font-medium">Average Block Time</CardTitle>
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
            <CardTitle className="text-sm font-medium">Avg Extrinsics</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageExtrinsics.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per block average
            </p>
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
            <p className="text-xs text-muted-foreground">
              Block size average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>
            Filter blocks by status, validator, or other criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="finalized">Finalized</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Validator</label>
              <Input
                placeholder="Enter validator address..."
                value={validatorFilter}
                onChange={(e) => setValidatorFilter(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Per Page</label>
              <Select value={limit.toString()} onValueChange={(value: string) => setLimit(Number(value))}>
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
          <CardDescription>
            {blocksData?.pagination && (
              <>
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, blocksData.pagination.total)} of {blocksData.pagination.total.toLocaleString()} blocks
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={blocksData?.data || []}
            loading={isLoading}
            searchable={false}
            filterable={true}
            pagination={{
              pageSize: limit,
              showSizeSelector: false,
            }}
            emptyMessage={error ? "Failed to load blocks" : "No blocks found"}
          />
          
          {/* Custom Pagination */}
          {blocksData?.pagination && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {page} of {blocksData.pagination.totalPages}
              </div>
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
                  disabled={page >= blocksData.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
