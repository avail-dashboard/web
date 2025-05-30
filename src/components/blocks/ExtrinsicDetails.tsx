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

export function ExtrinsicDetails({ extrinsic, onBack }: ExtrinsicDetailsProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatFee = (fee?: number) => {
    if (!fee) return 'N/A'
    // Convert from smallest unit to AVAIL (assuming 18 decimals)
    const avail = fee / Math.pow(10, 18)
    return `${avail.toFixed(6)} AVAIL`
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

  // Mock events data - in reality this would come from the API
  const mockEvents = [
    {
      eventIndex: 0,
      module: 'system',
      event: 'ExtrinsicSuccess',
      phase: 'ApplyExtrinsic',
      data: { weight: '195000000' },
    },
    {
      eventIndex: 1,
      module: 'balances',
      event: 'Transfer',
      phase: 'ApplyExtrinsic',
      data: {
        from: extrinsic.signer,
        to: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        amount: '1000000000000000000',
      },
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="text-avail-600 hover:text-avail-700 flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          )}
          <h1 className="text-3xl font-bold">Extrinsic Details</h1>
        </div>

        {/* Status indicator */}
        <div
          className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${getStatusColor(extrinsic.success)}`}
        >
          {extrinsic.success ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <span className="font-medium">
            {extrinsic.success ? 'Success' : 'Failed'}
          </span>
        </div>
      </div>

      {/* Main Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Basic Information */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Hash className="h-5 w-5 mr-2 text-avail-600" />
            Transaction Information
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">Hash:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm break-all">
                  {extrinsic.hash}
                </span>
                <button
                  onClick={() => copyToClipboard(extrinsic.hash, 'hash')}
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

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Block:</span>
              <Link
                href={`/blocks/${extrinsic.blockNumber}`}
                className="text-avail-600 hover:text-avail-700 font-mono flex items-center space-x-1"
              >
                <span>#{extrinsic.blockNumber}</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            {extrinsic.index !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Index:</span>
                <span className="font-mono">{extrinsic.index}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Module:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getModuleColor(extrinsic.section)}`}
              >
                {extrinsic.section}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Call:</span>
              <span className="font-medium">{extrinsic.method}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Timestamp:</span>
              <div className="text-right">
                <div className="font-semibold">
                  {new Date(extrinsic.timestamp).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatTimeAgo(extrinsic.timestamp)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account and Fee Information */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-avail-600" />
            Account & Fee Details
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">Signer:</span>
              <div className="flex items-center space-x-2">
                <Link
                  href={`/accounts/${extrinsic.signer}`}
                  className="font-mono text-sm text-avail-600 hover:text-avail-700 break-all"
                >
                  {extrinsic.signer}
                </Link>
                <button
                  onClick={() => copyToClipboard(extrinsic.signer, 'signer')}
                  className="p-1 hover:bg-muted rounded"
                  title="Copy address"
                >
                  <Copy className="h-3 w-3" />
                </button>
                {copied === 'signer' && (
                  <span className="text-green-500 text-xs">Copied!</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Transaction Fee:</span>
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono">
                  {formatFee(parseFloat(extrinsic.fee))}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status:</span>
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
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-avail-600" />
          Events ({mockEvents.length})
        </h2>
        <div className="space-y-3">
          {mockEvents.map((event, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-mono text-muted-foreground">
                    #{event.eventIndex}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getModuleColor(event.module)}`}
                  >
                    {event.module}
                  </span>
                  <span className="font-medium">{event.event}</span>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {event.phase}
                </span>
              </div>

              {/* Event data */}
              <div className="bg-muted/50 rounded p-3 mt-3">
                <div className="text-sm font-mono">
                  <pre className="whitespace-pre-wrap text-xs">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
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
