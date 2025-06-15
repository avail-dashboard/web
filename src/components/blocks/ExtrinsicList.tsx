'use client'

import { useState } from 'react'
import { Extrinsic } from '@/lib/api'
import { formatTimeAgo } from '@/lib/utils'
import {
  CheckCircle,
  XCircle,
  Filter,
  Copy,
  Hash,
  Clock,
  User,
} from 'lucide-react'
import Link from 'next/link'

interface ExtrinsicListProps {
  extrinsics: Extrinsic[]
  showBlockNumber?: boolean
  compact?: boolean
  showFilters?: boolean
}

// Helper function to get extrinsic index
const getExtrinsicIndex = (extrinsic: Extrinsic): number => {
  return extrinsic.extrinsic_index ?? extrinsic.extrinsicIndex ?? 0
}

// Helper function to get block number
const getBlockNumber = (extrinsic: Extrinsic): number => {
  // Extract from ID if available (format: "blockNumber-index")
  if (extrinsic.id && typeof extrinsic.id === 'string') {
    const parts = extrinsic.id.split('-')
    if (parts.length >= 2) {
      const blockNum = parseInt(parts[0], 10)
      if (!isNaN(blockNum)) {
        return blockNum
      }
    }
  }
  return extrinsic.blockNumber ?? 0
}

// Helper function to format fee/tip values
const formatFeeValue = (value: number | string | undefined): string => {
  if (value === undefined || value === null) return 'N/A'
  if (typeof value === 'string') return value
  return value.toString()
}

export function ExtrinsicList({
  extrinsics,
  showBlockNumber = true,
  compact = false,
  showFilters = false,
}: ExtrinsicListProps) {
  const [filter, setFilter] = useState('')
  const [moduleFilter, setModuleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'success' | 'failed'
  >('all')

  // Filter extrinsics based on current filters
  const filteredExtrinsics = extrinsics.filter(extrinsic => {
    const matchesSearch =
      !filter ||
      (extrinsic.hash &&
        extrinsic.hash.toLowerCase().includes(filter.toLowerCase())) ||
      (extrinsic.signer &&
        extrinsic.signer.toLowerCase().includes(filter.toLowerCase())) ||
      (extrinsic.module &&
        extrinsic.module.toLowerCase().includes(filter.toLowerCase())) ||
      (extrinsic.call &&
        extrinsic.call.toLowerCase().includes(filter.toLowerCase()))

    const matchesModule =
      !moduleFilter ||
      (extrinsic.module &&
        extrinsic.module.toLowerCase().includes(moduleFilter.toLowerCase()))

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'success' && extrinsic.success) ||
      (statusFilter === 'failed' && !extrinsic.success)

    return matchesSearch && matchesModule && matchesStatus
  })

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getModuleColor = (module: string) => {
    const colors = {
      system: 'bg-blue-100 text-blue-800',
      balances: 'bg-green-100 text-green-800',
      staking: 'bg-purple-100 text-purple-800',
      utility: 'bg-orange-100 text-orange-800',
      dataAvailability: 'bg-indigo-100 text-indigo-800',
      default: 'bg-gray-100 text-gray-800',
    }
    return colors[module as keyof typeof colors] || colors.default
  }

  if (extrinsics.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No extrinsics found
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search hash, signer, module..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="px-3 py-1 border rounded text-sm"
            />
          </div>
          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="">All Modules</option>
            <option value="system">System</option>
            <option value="balances">Balances</option>
            <option value="staking">Staking</option>
            <option value="utility">Utility</option>
            <option value="dataAvailability">Data Availability</option>
          </select>
          <select
            value={statusFilter}
            onChange={e =>
              setStatusFilter(e.target.value as 'all' | 'success' | 'failed')
            }
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      )}

      {/* Extrinsics List */}
      <div className="space-y-2">
        {filteredExtrinsics.map((extrinsic, index) => {
          const extrinsicIndex = getExtrinsicIndex(extrinsic)
          const blockNumber = getBlockNumber(extrinsic)

          return (
            <div
              key={extrinsic.hash || index}
              className={`border rounded-lg p-4 hover:bg-muted/30 transition-colors ${
                compact ? 'p-3' : 'p-4'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Header Row */}
                  <div className="flex items-center space-x-3 mb-2">
                    {/* Status Icon */}
                    {extrinsic.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    )}

                    {/* Hash */}
                    <Link
                      href={`/extrinsics/${extrinsic.hash || 'unknown'}`}
                      className="font-mono text-sm text-avail-600 hover:text-avail-700 truncate"
                    >
                      {extrinsic.hash || 'Hash not available'}
                    </Link>

                    {/* Copy Button */}
                    {extrinsic.hash && (
                      <button
                        onClick={() => copyToClipboard(extrinsic.hash!)}
                        className="p-1 hover:bg-muted rounded flex-shrink-0"
                        title="Copy hash"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Details Row */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {/* Block Number */}
                    {showBlockNumber && (
                      <Link
                        href={`/blocks/${blockNumber}`}
                        className="flex items-center space-x-1 text-avail-600 hover:text-avail-700"
                      >
                        <Hash className="h-3 w-3" />
                        <span>Block #{blockNumber}</span>
                      </Link>
                    )}

                    {/* Index */}
                    <span className="flex items-center space-x-1">
                      <span>Index #{extrinsicIndex}</span>
                    </span>

                    {/* Module & Call */}
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getModuleColor(
                          extrinsic.module || 'default'
                        )}`}
                      >
                        {extrinsic.module || 'Unknown'}
                      </span>
                      <span className="font-medium">
                        {extrinsic.call || 'Unknown'}
                      </span>
                    </div>

                    {/* Signer */}
                    {extrinsic.signer ? (
                      <Link
                        href={`/accounts/${extrinsic.signer}`}
                        className="flex items-center space-x-1 text-avail-600 hover:text-avail-700"
                      >
                        <User className="h-3 w-3" />
                        <span className="font-mono">
                          {extrinsic.signer.slice(0, 6)}...
                          {extrinsic.signer.slice(-6)}
                        </span>
                      </Link>
                    ) : (
                      <span className="flex items-center space-x-1 text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>Signer not available</span>
                      </span>
                    )}

                    {/* Fee */}
                    <span className="flex items-center space-x-1">
                      <span>Fee: {formatFeeValue(extrinsic.fee)} AVAIL</span>
                    </span>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex items-center space-x-1 text-xs text-muted-foreground flex-shrink-0 ml-4">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(extrinsic.timestamp)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Results Summary */}
      {showFilters && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {filteredExtrinsics.length} of {extrinsics.length} extrinsics
        </div>
      )}
    </div>
  )
}
