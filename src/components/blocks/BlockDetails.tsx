'use client'

import React, { useState } from 'react'
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
  } = useBlock(blockNumber)

  const { data: extrinsics, loading: extrinsicsLoading } = useExtrinsics(
    Number(blockNumber)
  )

  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatWeight = (weight: string | number) => {
    if (typeof weight === 'string') {
      const weightNum = parseInt(weight, 10)
      return isNaN(weightNum) ? weight : weightNum.toLocaleString()
    }
    return weight.toLocaleString()
  }

  if (blockLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <span className="ml-4 text-muted-foreground">
          Loading block details...
        </span>
      </div>
    )
  }

  if (blockError || !block) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-2">Failed to load block details</div>
        <div className="text-muted-foreground">
          {blockError?.message || 'Block not found'}
        </div>
      </div>
    )
  }

  const currentBlockNumber = Number(blockNumber)

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold tracking-tight">Block #{block.number}</h1>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  block.finalized
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {block.finalized ? 'Finalized' : 'Pending'}
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          {onNavigate && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigate(currentBlockNumber - 1)}
                disabled={currentBlockNumber <= 1}
                className="flex items-center space-x-1 px-3 py-2 border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={() => onNavigate(currentBlockNumber + 1)}
                className="flex items-center space-x-1 px-3 py-2 border rounded-lg hover:bg-muted"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Block Information Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Hash className="h-5 w-5 mr-2 text-avail-600" />
          Block Information
        </h2>
        <div className="bg-card p-6 rounded-lg border shadow-sm">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Block Hash
              </label>
              <div className="flex items-center space-x-2 mt-1">
                {block.hash ? (
                  <>
                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono break-all">
                      {block.hash}
                    </code>
                    <button
                      onClick={() => copyToClipboard(block.hash!, 'hash')}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    {copied === 'hash' && (
                      <span className="text-xs text-green-600">Copied!</span>
                    )}
                  </>
                ) : (
                  <code className="text-sm bg-muted px-2 py-1 rounded font-mono break-all text-muted-foreground">
                    Pending backend deployment
                  </code>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {block.hash
                  ? 'Block hash from the blockchain'
                  : 'Backend team is deploying hash field fix'}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Parent Hash
              </label>
              <div className="flex items-center space-x-2 mt-1">
                <code className="text-sm bg-muted px-2 py-1 rounded font-mono break-all">
                  {block.parentHash || 'Parent hash not available'}
                </code>
                {block.parentHash && (
                  <>
                    <button
                      onClick={() =>
                        copyToClipboard(block.parentHash!, 'parent')
                      }
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    {copied === 'parent' && (
                      <span className="text-xs text-green-600">Copied!</span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                State Root
              </label>
              <div className="flex items-center space-x-2 mt-1">
                <code className="text-sm bg-muted px-2 py-1 rounded font-mono break-all">
                  {block.stateRoot || 'State root not available'}
                </code>
                {block.stateRoot && (
                  <>
                    <button
                      onClick={() =>
                        copyToClipboard(block.stateRoot!, 'state')
                      }
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    {copied === 'state' && (
                      <span className="text-xs text-green-600">Copied!</span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Extrinsics Root
              </label>
              <div className="flex items-center space-x-2 mt-1">
                <code className="text-sm bg-muted px-2 py-1 rounded font-mono break-all">
                  {block.extrinsics_root || 'Extrinsics root not available'}
                </code>
                {block.extrinsics_root && (
                  <>
                    <button
                      onClick={() =>
                        copyToClipboard(block.extrinsics_root!, 'extrinsics')
                      }
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    {copied === 'extrinsics' && (
                      <span className="text-xs text-green-600">Copied!</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Block Author
              </label>
              <div className="flex items-center space-x-2 mt-1">
                {block.validator && block.validator.trim() !== '' ? (
                  <>
                    <Link
                      href={`/accounts/${block.validator}`}
                      className="text-avail-600 hover:text-avail-700 font-mono text-sm flex items-center space-x-1"
                    >
                      <span>
                        {block.validator.slice(0, 8)}...
                        {block.validator.slice(-8)}
                      </span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <button
                      onClick={() => copyToClipboard(block.validator!, 'author')}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    {copied === 'author' && (
                      <span className="text-xs text-green-600">Copied!</span>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    Author not available (empty in API response)
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Timestamp
              </label>
              <div className="mt-1">
                <span className="text-sm">
                  {new Date(block.timestamp).toLocaleString()}
                </span>
                <div className="text-xs text-muted-foreground">
                  {formatTimeAgo(block.timestamp)}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Block Size
              </label>
              <div className="mt-1">
                <span className="font-medium">
                  {block.size ? formatBytes(block.size) : 'Size not available'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Block Weight
              </label>
              <div className="mt-1">
                <span className="font-medium">
                  {block.weight
                    ? formatWeight(block.weight)
                    : 'Weight not available'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Spec Version
              </label>
              <div className="mt-1">
                <span className="font-medium">{block.spec}</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Extrinsics Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-avail-600" />
          Extrinsics ({block.extrinsicsCount || 0})
        </h2>
        <div className="bg-card p-6 rounded-lg border shadow-sm">
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
      </section>
    </div>
  )
}
