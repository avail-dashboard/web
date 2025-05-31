'use client'

import { useState, useEffect } from 'react'
import { useExtrinsics } from '@/lib/hooks/useAvailAPI'
import { formatTimeAgo } from '@/lib/utils'
import {
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  ExternalLink,
  RefreshCw,
  Coins,
} from 'lucide-react'
import Link from 'next/link'

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
  const [copied, setCopied] = useState<string | null>(null)

  // Get recent extrinsics and filter for transfers
  const {
    data: extrinsics,
    loading,
    error,
    refetch,
  } = useExtrinsics(undefined, 0, 50)

  useEffect(() => {
    if (extrinsics) {
      // Filter for balance transfer extrinsics
      const transferExtrinsics = extrinsics
        .filter(
          ext =>
            ext.section === 'balances' &&
            (ext.method === 'transfer' ||
              ext.method === 'transfer_keep_alive' ||
              ext.method === 'transfer_all')
        )
        .slice(0, limit)
        .map(ext => {
          // TODO: Replace with actual transfer data extraction from extrinsic events
          // In a real implementation, this would parse the extrinsic events to extract
          // the actual transfer details (from, to, amount) from Transfer events

          // For now, return a basic structure with available data
          return {
            hash: ext.hash,
            blockNumber: ext.blockNumber,
            timestamp: new Date(ext.timestamp).getTime(),
            from: ext.signer, // This is known from the extrinsic
            to: 'Unknown', // This would come from parsing events
            amount: '0', // This would come from parsing events
            success: ext.success,
            fee: parseFloat(ext.fee),
          }
        })

      setTransfers(transferExtrinsics)
    }
  }, [extrinsics, limit])

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
      <div className="text-center py-8">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold mb-2">Failed to Load Transfers</h3>
        <p className="text-muted-foreground mb-4">
          Unable to fetch transfer data.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-avail-600 text-white rounded hover:bg-avail-700"
        >
          Try Again
        </button>
      </div>
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
            onClick={() => refetch()}
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
                        className="font-mono text-sm text-avail-600 hover:text-avail-700"
                      >
                        {compact ? formatAddress(transfer.hash) : transfer.hash}
                      </Link>
                      <button
                        onClick={() =>
                          copyToClipboard(transfer.hash, `hash-${index}`)
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
                        className="font-mono text-avail-600 hover:text-avail-700"
                      >
                        {formatAddress(transfer.from)}
                      </Link>
                    </div>
                    <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">To:</span>
                      <Link
                        href={`/accounts/${transfer.to}`}
                        className="font-mono text-avail-600 hover:text-avail-700"
                      >
                        {formatAddress(transfer.to)}
                      </Link>
                    </div>
                  </div>

                  {/* Block and time */}
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <Link
                      href={`/blocks/${transfer.blockNumber}`}
                      className="hover:text-avail-600 flex items-center space-x-1"
                    >
                      <span>
                        Block #{transfer.blockNumber.toLocaleString()}
                      </span>
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
          <h3 className="text-lg font-semibold mb-2">No Transfers Found</h3>
          <p className="text-muted-foreground">
            No recent transfer transactions available.
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
