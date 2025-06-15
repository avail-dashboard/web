'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatTimeAgo } from '@/lib/utils'
import Link from 'next/link'
import {
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Coins,
  RefreshCw,
} from 'lucide-react'
import { ErrorDisplay } from '@/components/ui/ErrorDisplay'
import { CopyableValue } from '@/components/ui/copyable-value'

interface Transfer {
  hash: string
  blockNumber: number
  timestamp: number
  from: string
  to: string
  amount: string
  success: boolean
  fee?: number
}

interface TransfersTableProps {
  limit?: number
  showHeader?: boolean
  compact?: boolean
}

export function TransfersTable({
  limit = 10,
  showHeader = true,
  compact = false,
}: TransfersTableProps) {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransfers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))

      // For now, return empty array since transfer API is not available
      // This prevents the error state and shows a nice empty state instead
      setTransfers([])
    } catch {
      setError('Failed to load transfer data')
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchTransfers()
  }, [fetchTransfers])



  const formatAddress = (address: string) => {
    if (address.length <= 12) return address
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  const formatAmount = (amount: string) => {
    return `${parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })} AVAIL`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="mt-4 text-muted-foreground">Loading transfers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorDisplay
        error={new Error(error)}
        onRetry={fetchTransfers}
      />
    )
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-avail-600" />
            <h3 className="text-lg font-semibold">Recent Transfers</h3>
          </div>
          <button
            onClick={fetchTransfers}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 text-sm border rounded hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      )}

      {transfers.length > 0 ? (
        <div className="space-y-2">
          {transfers.map((transfer, index) => (
            <div
              key={`${transfer.hash}-${index}`}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                compact ? 'p-3' : 'p-4'
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Left side - Transfer info */}
                <div className="flex-1 space-y-2">
                  {/* Hash and Status */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {transfer.success ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-red-600" />
                      )}
                      <Link
                        href={`/extrinsics/${transfer.hash}`}
                        className="text-sm text-avail-600 hover:text-avail-700"
                      >
                        <CopyableValue
                          value={transfer.hash}
                          displayValue={compact ? formatAddress(transfer.hash) : transfer.hash}
                          valueClassName="text-avail-600"
                        />
                      </Link>
                    </div>

                    {/* Status badge */}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transfer.success
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transfer.success ? 'Success' : 'Failed'}
                    </span>
                  </div>

                  {/* Transfer details */}
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">From:</span>
                      <Link
                        href={`/accounts/${transfer.from}`}
                        className="text-avail-600 hover:text-avail-700"
                      >
                        <CopyableValue
                          value={transfer.from}
                          displayValue={formatAddress(transfer.from)}
                          valueClassName="text-avail-600"
                        />
                      </Link>
                    </div>
                    <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">To:</span>
                      <Link
                        href={`/accounts/${transfer.to}`}
                        className="text-avail-600 hover:text-avail-700"
                      >
                        <CopyableValue
                          value={transfer.to}
                          displayValue={formatAddress(transfer.to)}
                          valueClassName="text-avail-600"
                        />
                      </Link>
                    </div>
                  </div>

                  {/* Block and time */}
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <Link
                      href={`/blocks/${transfer.blockNumber}`}
                      className="hover:text-avail-600 flex items-center space-x-1"
                    >
                      <CopyableValue
                        value={transfer.blockNumber.toString()}
                        displayValue={`Block #${transfer.blockNumber.toLocaleString()}`}
                        monospace={true}
                        valueClassName="hover:text-avail-600"
                      />
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <span>{formatTimeAgo(transfer.timestamp)}</span>
                  </div>
                </div>

                {/* Right side - Amount */}
                <div className="text-right">
                  <div className="text-lg font-bold text-avail-600">
                    {formatAmount(transfer.amount)}
                  </div>
                  {transfer.fee && (
                    <div className="text-xs text-muted-foreground">
                      Fee: {(transfer.fee / Math.pow(10, 18)).toFixed(6)} AVAIL
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-muted-foreground text-4xl mb-4">💸</div>
          <h3 className="text-lg font-semibold mb-2">Transfers Coming Soon</h3>
          <p className="text-muted-foreground">
            Transfer tracking is not yet available. This feature will be added when transfer API endpoints are implemented.
          </p>
        </div>
      )}

      {/* Summary */}
      {transfers.length > 0 && (
        <div className="text-sm text-muted-foreground text-center pt-4 border-t">
          Showing {transfers.length} recent transfer
          {transfers.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
