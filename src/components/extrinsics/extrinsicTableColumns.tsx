import { ColumnDef } from '@tanstack/react-table'
import {
  ArrowUpDown,
  Clock,
  Hash,
  User,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { Extrinsic } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatTimeAgo, formatFee, getMethodColor } from '@/lib/utils/extrinsicFormatters'

export const extrinsicTableColumns: ColumnDef<Extrinsic>[] = [
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