'use client'

import React, { useState, useEffect } from 'react'
import { useBlock, useExtrinsics } from '@/lib/hooks/useAvailAPI'
import { formatTimeAgo } from '@/lib/utils'
import { ExtrinsicList } from './ExtrinsicList'
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Hash,
  Users,
  Activity,
} from 'lucide-react'
import Link from 'next/link'

interface BlockDetailsProps {
  blockNumber: number | string
  onNavigate?: (blockNumber: number) => void
}

export function BlockDetails({ blockNumber, onNavigate }: BlockDetailsProps) {
  const {
    data: block,
    loading: blockLoading,
    error: blockError,
    refetch,
  } = useBlock(blockNumber)
  const { data: extrinsics, loading: extrinsicsLoading } = useExtrinsics(
    typeof blockNumber === 'string' ? parseInt(blockNumber) : blockNumber
  )

  const [copied, setCopied] = useState<string | null>(null)

  // Auto-refresh every 30 seconds for latest blocks
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 30000)
    return () => clearInterval(interval)
  }, [refetch])

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handlePrevBlock = () => {
    if (block && onNavigate) {
      onNavigate(block.number - 1)
    }
  }

  const handleNextBlock = () => {
    if (block && onNavigate) {
      onNavigate(block.number + 1)
    }
  }

  if (blockLoading && !block) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="mt-4 text-muted-foreground">Loading block details...</p>
        </div>
      </div>
    )
  }

  if (blockError || !block) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Block Not Found</h2>
          <p className="text-muted-foreground mb-4">
            Block #{blockNumber} could not be found or loaded.
          </p>
          <Link
            href="/blocks"
            className="bg-avail-600 text-white px-4 py-2 rounded hover:bg-avail-700"
          >
            Back to Blocks
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/blocks"
            className="text-avail-600 hover:text-avail-700 flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Blocks</span>
          </Link>
          <h1 className="text-3xl font-bold">Block #{block.number}</h1>
        </div>

        {/* Block Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevBlock}
            disabled={block.number <= 1}
            className="p-2 border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous Block"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNextBlock}
            className="p-2 border rounded hover:bg-muted"
            title="Next Block"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => refetch()}
            disabled={blockLoading}
            className="px-3 py-2 bg-avail-600 text-white rounded hover:bg-avail-700 disabled:opacity-50"
          >
            {blockLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Block Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Basic Information */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Hash className="h-5 w-5 mr-2 text-avail-600" />
            Block Information
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Block Number:</span>
              <span className="font-mono font-semibold">{block.number}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">Hash:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm break-all">
                  {block.hash}
                </span>
                <button
                  onClick={() => copyToClipboard(block.hash, 'hash')}
                  className="p-1 hover:bg-muted rounded"
                  title="Copy hash"
                >
                  <Copy className="h-3 w-3" />
                </button>
                {copied === 'hash' && (
                  <span className="text-green-500 text-xs">Copied!</span>
                )}
              </div>
            </div>
            {block.parentHash && (
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Parent Hash:</span>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/blocks/${block.number - 1}`}
                    className="font-mono text-sm text-avail-600 hover:text-avail-700 break-all"
                  >
                    {block.parentHash}
                  </Link>
                  <ExternalLink className="h-3 w-3 text-avail-600" />
                </div>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Timestamp:</span>
              <div className="text-right">
                <div className="font-semibold">
                  {new Date(block.timestamp).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatTimeAgo(new Date(block.timestamp).getTime())}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-avail-600" />
            Block Statistics
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Extrinsics:</span>
              <span className="font-semibold text-avail-600">
                {block.extrinsicsCount}
              </span>
            </div>
            {block.stateRoot && (
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">State Root:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm break-all">
                    {block.stateRoot}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(block.stateRoot!, 'stateRoot')
                    }
                    className="p-1 hover:bg-muted rounded"
                    title="Copy state root"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  {copied === 'stateRoot' && (
                    <span className="text-green-500 text-xs">Copied!</span>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Block Time:</span>
              <span className="font-semibold">~12 seconds</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status:</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Finalized
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Extrinsics Section */}
      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-avail-600" />
          Extrinsics ({block.extrinsicsCount})
        </h2>
        {extrinsicsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <span className="ml-4 text-muted-foreground">
              Loading extrinsics...
            </span>
          </div>
        ) : extrinsics && extrinsics.length > 0 ? (
          <ExtrinsicList
            extrinsics={extrinsics}
            showBlockNumber={false}
            compact={false}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No extrinsics found in this block
          </div>
        )}
      </div>
    </div>
  )
}
