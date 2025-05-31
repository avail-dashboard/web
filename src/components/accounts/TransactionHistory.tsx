'use client'

import { useState, useEffect } from 'react'
import { useExtrinsics } from '@/lib/hooks/useAvailAPI'
import { ExtrinsicList } from '@/components/blocks/ExtrinsicList'
import { Extrinsic } from '@/lib/api'
import { RefreshCw, Filter } from 'lucide-react'

interface TransactionHistoryProps {
  address: string
}

export function TransactionHistory({ address }: TransactionHistoryProps) {
  const [filteredExtrinsics, setFilteredExtrinsics] = useState<Extrinsic[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all')

  // Get all extrinsics and filter by address
  const {
    data: allExtrinsics,
    loading: extrinsicsLoading,
    refetch,
  } = useExtrinsics(undefined, 0, 50)

  useEffect(() => {
    if (allExtrinsics) {
      // Filter extrinsics related to this address
      const accountExtrinsics = allExtrinsics.filter(ext => {
        // TODO: In a real implementation, this would check if the address is involved
        // in the transaction (as sender, receiver, or in events) by examining the
        // extrinsic events and parameters
        return ext.signer === address
      })

      // Apply additional filters
      let filtered = accountExtrinsics
      if (filter === 'sent') {
        filtered = accountExtrinsics.filter(ext => ext.signer === address)
      } else if (filter === 'received') {
        // TODO: Implement proper received transaction filtering
        // This would require checking transfer events to see if this address was a recipient
        filtered = []
      }

      setFilteredExtrinsics(filtered)
    }
    setLoading(extrinsicsLoading)
  }, [allExtrinsics, extrinsicsLoading, address, filter])

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
          <p className="mt-4 text-muted-foreground">
            Loading transaction history...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter:</span>
          </div>

          <select
            value={filter}
            onChange={e =>
              setFilter(e.target.value as 'all' | 'sent' | 'received')
            }
            className="text-sm border rounded px-3 py-1 bg-background"
          >
            <option value="all">All Transactions</option>
            <option value="sent">Sent</option>
            <option value="received">Received</option>
          </select>
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

      {/* Transaction List */}
      {filteredExtrinsics.length > 0 ? (
        <ExtrinsicList
          extrinsics={filteredExtrinsics}
          showBlockNumber={true}
          compact={true}
          showFilters={false}
        />
      ) : (
        <div className="text-center py-8">
          <div className="text-muted-foreground text-4xl mb-4">📄</div>
          <h3 className="text-lg font-semibold mb-2">No Transactions Found</h3>
          <p className="text-muted-foreground">
            {filter === 'all'
              ? 'This account has no transaction history yet.'
              : `No ${filter} transactions found for this account.`}
          </p>
        </div>
      )}

      {/* Summary */}
      {filteredExtrinsics.length > 0 && (
        <div className="text-sm text-muted-foreground text-center pt-4 border-t">
          Showing {filteredExtrinsics.length} transaction
          {filteredExtrinsics.length !== 1 ? 's' : ''}
          {filter !== 'all' && ` (${filter})`}
        </div>
      )}
    </div>
  )
}
