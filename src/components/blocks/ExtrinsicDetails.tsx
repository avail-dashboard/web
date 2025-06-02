'use client'

import { useState } from 'react'
import { Extrinsic } from '@/lib/api'
import { formatTimeAgo } from '@/lib/utils'
import {
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  Hash,
  User,
  DollarSign,
  Activity,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

interface ExtrinsicDetailsProps {
  extrinsic: Extrinsic
  onBack?: () => void
}

// Helper function to format fee/tip values
const formatFeeValue = (value: number | string | undefined): string => {
  if (value === undefined || value === null) return 'Not available'
  if (typeof value === 'string') return value
  return value.toString()
}

// Helper function to get extrinsic index
const getExtrinsicIndex = (extrinsic: Extrinsic): number => {
  return extrinsic.extrinsic_index ?? extrinsic.extrinsicIndex ?? 0
}

// Helper function to get block number
const getBlockNumber = (extrinsic: Extrinsic): number => {
  // Extract from ID if available (format: "blockNumber-index")
  if (extrinsic.id) {
    const parts = extrinsic.id.split('-')
    if (parts.length >= 2) {
      return parseInt(parts[0], 10)
    }
  }
  return extrinsic.blockNumber ?? 0
}

export function ExtrinsicDetails({ extrinsic, onBack }: ExtrinsicDetailsProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const events = extrinsic.events || []
  const extrinsicIndex = getExtrinsicIndex(extrinsic)
  const blockNumber = getBlockNumber(extrinsic)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          )}
          <h1 className="text-2xl font-bold">Extrinsic Details</h1>
        </div>
        <div className="flex items-center space-x-2">
          {extrinsic.success ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Success</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Failed</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Extrinsic Hash
              </label>
              <div className="flex items-center space-x-2 mt-1">
                <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                  {extrinsic.hash || 'Hash not available'}
                </code>
                {extrinsic.hash && (
                  <>
                    <button
                      onClick={() => copyToClipboard(extrinsic.hash!, 'hash')}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    {copied === 'hash' && (
                      <span className="text-xs text-green-600">Copied!</span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Block Number
              </label>
              <div className="flex items-center space-x-2 mt-1">
                <Link
                  href={`/blocks/${blockNumber}`}
                  className="text-avail-600 hover:text-avail-700 font-medium flex items-center space-x-1"
                >
                  <span>#{blockNumber}</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Extrinsic Index
              </label>
              <div className="mt-1">
                <span className="font-medium">#{extrinsicIndex}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Module & Call
              </label>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {extrinsic.module || 'Unknown'}
                </span>
                <span className="font-medium">
                  {extrinsic.call || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Signer
              </label>
              <div className="flex items-center space-x-2 mt-1">
                {extrinsic.signer ? (
                  <>
                    <Link
                      href={`/accounts/${extrinsic.signer}`}
                      className="text-avail-600 hover:text-avail-700 font-mono text-sm flex items-center space-x-1"
                    >
                      <User className="h-3 w-3" />
                      <span>
                        {extrinsic.signer.slice(0, 8)}...
                        {extrinsic.signer.slice(-8)}
                      </span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <button
                      onClick={() =>
                        copyToClipboard(extrinsic.signer!, 'signer')
                      }
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    {copied === 'signer' && (
                      <span className="text-xs text-green-600">Copied!</span>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    Signer not available
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Fee
              </label>
              <div className="flex items-center space-x-2 mt-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono">
                  {formatFeeValue(extrinsic.fee)} AVAIL
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Tip
              </label>
              <div className="flex items-center space-x-2 mt-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono">
                  {formatFeeValue(extrinsic.tip)} AVAIL
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Timestamp
              </label>
              <div className="mt-1">
                <span className="text-sm">
                  {new Date(extrinsic.timestamp).toLocaleString()}
                </span>
                <div className="text-xs text-muted-foreground">
                  {formatTimeAgo(extrinsic.timestamp)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Hash className="h-5 w-5 mr-2 text-avail-600" />
          Signature
        </h2>
        <div className="bg-muted/50 rounded p-4">
          <code className="text-sm font-mono break-all">
            {extrinsic.signature}
          </code>
        </div>
      </div>

      {/* Arguments Section */}
      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Call Arguments</h2>
        {extrinsic.args && Object.keys(extrinsic.args).length > 0 ? (
          <div className="bg-muted/50 rounded p-4">
            <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(extrinsic.args, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No arguments available. Arguments require API integration to fetch
            real data.
          </div>
        )}
      </div>

      {/* Events Section */}
      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-avail-600" />
          Events ({events.length})
        </h2>

        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {event.section}
                    </span>
                    <span className="font-medium">{event.method}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    #{event.eventIndex}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Phase: {event.phase}
                </div>
                {event.data && (
                  <div className="mt-2 p-2 bg-muted/30 rounded text-xs font-mono">
                    {JSON.stringify(event.data, null, 2)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No events available. Events require API integration to fetch real
            data.
          </div>
        )}
      </div>

      {/* Raw Data Section */}
      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Raw Extrinsic Data</h2>
        <div className="bg-muted/50 rounded p-4">
          <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(extrinsic, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
