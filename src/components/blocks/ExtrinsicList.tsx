'use client'

import { useState } from 'react'
import { Extrinsic } from '@/lib/api'
import { formatTimeAgo } from '@/lib/utils'
import {
  CheckCircle,
  XCircle,
  Filter,
  ExternalLink,
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

export function ExtrinsicList({
  extrinsics,
  showBlockNumber = true,
  compact = false,
  showFilters = true,
}: ExtrinsicListProps) {
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all')
  const [moduleFilter, setModuleFilter] = useState<string>('all')
  const [copied, setCopied] = useState<string | null>(null)

  // Debug: Log the extrinsics data to see its structure
  console.log('ExtrinsicList received extrinsics:', extrinsics)

  // Get unique modules for filtering
  const uniqueModules = Array.from(new Set(extrinsics.map(ext => ext.module)))

  // Validate and filter extrinsics
  const filteredExtrinsics = extrinsics.filter(extrinsic => {
    // Ensure all required properties exist
    if (!extrinsic || typeof extrinsic !== 'object') {
      console.error('Invalid extrinsic:', extrinsic)
      return false
    }

    // Check for required properties and their types
    const requiredProps = {
      hash: 'string',
      blockNumber: 'number',
      module: 'string',
      call: 'string',
      success: 'boolean',
      timestamp: 'number',
      signer: 'string',
    }

    for (const [prop, expectedType] of Object.entries(requiredProps)) {
      if (!(prop in extrinsic)) {
        console.error(`Extrinsic missing required property: ${prop}`, extrinsic)
        return false
      }
      if (typeof extrinsic[prop as keyof Extrinsic] !== expectedType) {
        console.error(
          `Extrinsic property ${prop} has wrong type. Expected ${expectedType}, got ${typeof extrinsic[prop as keyof Extrinsic]}`,
          extrinsic
        )
        return false
      }
    }

    const statusMatch =
      filter === 'all' ||
      (filter === 'success' && extrinsic.success) ||
      (filter === 'failed' && !extrinsic.success)

    const moduleMatch =
      moduleFilter === 'all' || extrinsic.module === moduleFilter

    return statusMatch && moduleMatch
  })

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  const getStatusColor = (success: boolean) => {
    return success
      ? 'text-green-600 bg-green-50 border-green-200'
      : 'text-red-600 bg-red-50 border-red-200'
  }

  const getModuleColor = (module: string) => {
    const colors = {
      system: 'bg-blue-100 text-blue-800',
      balances: 'bg-green-100 text-green-800',
      staking: 'bg-purple-100 text-purple-800',
      utility: 'bg-orange-100 text-orange-800',
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
        <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-muted-foreground">Status:</label>
            <select
              value={filter}
              onChange={e =>
                setFilter(e.target.value as 'all' | 'success' | 'failed')
              }
              className="text-sm border rounded px-2 py-1 bg-background"
            >
              <option value="all">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Module Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-muted-foreground">Module:</label>
            <select
              value={moduleFilter}
              onChange={e => setModuleFilter(e.target.value)}
              className="text-sm border rounded px-2 py-1 bg-background"
            >
              <option value="all">All Modules</option>
              {uniqueModules.map(module => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredExtrinsics.length} of {extrinsics.length}{' '}
            extrinsics
          </div>
        </div>
      )}

      {/* Extrinsics List */}
      <div className="space-y-2">
        {filteredExtrinsics.map((extrinsic, index) => (
          <div
            key={`${extrinsic.hash}-${index}`}
            className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
              compact ? 'p-3' : 'p-4'
            }`}
          >
            <div className="flex items-start justify-between">
              {/* Left side - Main info */}
              <div className="flex-1 space-y-2">
                {/* Hash and Status */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <Link
                      href={`/extrinsics/${extrinsic.hash}`}
                      className="font-mono text-sm text-avail-600 hover:text-avail-700"
                    >
                      {compact ? formatAddress(extrinsic.hash) : extrinsic.hash}
                    </Link>
                    <button
                      onClick={() =>
                        copyToClipboard(extrinsic.hash, `hash-${index}`)
                      }
                      className="p-1 hover:bg-muted rounded"
                      title="Copy hash"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    {copied === `hash-${index}` && (
                      <span className="text-green-500 text-xs">Copied!</span>
                    )}
                  </div>

                  {/* Status indicator */}
                  <div
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs ${getStatusColor(extrinsic.success)}`}
                  >
                    {extrinsic.success ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    <span>{extrinsic.success ? 'Success' : 'Failed'}</span>
                  </div>
                </div>

                {/* Module and Call */}
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getModuleColor(extrinsic.module)}`}
                  >
                    {extrinsic.module}
                  </span>
                  <span className="text-sm font-medium">{extrinsic.call}</span>
                </div>

                {/* Block and Signer info */}
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  {showBlockNumber && (
                    <div className="flex items-center space-x-1">
                      <span>Block:</span>
                      <Link
                        href={`/blocks/${extrinsic.blockNumber}`}
                        className="text-avail-600 hover:text-avail-700 font-mono"
                      >
                        #{extrinsic.blockNumber}
                      </Link>
                    </div>
                  )}

                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>Signer:</span>
                    <Link
                      href={`/accounts/${extrinsic.signer}`}
                      className="text-avail-600 hover:text-avail-700 font-mono"
                    >
                      {formatAddress(extrinsic.signer)}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right side - Timestamp */}
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(extrinsic.timestamp)}</span>
                </div>
                {!compact && (
                  <div className="text-xs mt-1">
                    {new Date(extrinsic.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No results message */}
      {filteredExtrinsics.length === 0 && extrinsics.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No extrinsics match the current filters
        </div>
      )}
    </div>
  )
}
