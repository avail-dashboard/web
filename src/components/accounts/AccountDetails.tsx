'use client'

import React, { useState } from 'react'
import { useAccount } from '@/lib/hooks/useAvailAPI'
import { TransactionHistory } from './TransactionHistory'
import { BalanceChart } from './BalanceChart'
import { StakingInfo } from './StakingInfo'
import {
  Copy,
  Wallet,
  TrendingUp,
  Shield,
  Activity,
  RefreshCw,
} from 'lucide-react'

interface AccountDetailsProps {
  address: string
}

export function AccountDetails({ address }: AccountDetailsProps) {
  const { data: account, loading, error, refetch } = useAccount(address)
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<
    'overview' | 'transactions' | 'staking'
  >('overview')

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatBalance = (balance: string | number) => {
    const balanceNum = typeof balance === 'string' ? parseFloat(balance) : balance
    return (balanceNum / 1e18).toFixed(6)
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`
  }

  // TODO: Replace with actual API call to fetch additional account metadata
  // Additional account data would come from API integration

  if (loading && !account) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="mt-4 text-muted-foreground">
            Loading account details...
          </p>
        </div>
      </div>
    )
  }

  if (error || !account) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Account Not Found</h2>
          <p className="text-muted-foreground mb-4">
            Account {formatAddress(address)} could not be found or loaded.
          </p>
          <button
            onClick={() => refetch()}
            className="bg-avail-600 text-white px-4 py-2 rounded hover:bg-avail-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Account Details</h1>
          <div className="flex items-center space-x-2 mt-2">
            <span className="font-mono text-lg text-muted-foreground">
              {address}
            </span>
            <button
              onClick={() => copyToClipboard(address, 'address')}
              className="p-1 hover:bg-muted rounded"
              title="Copy address"
            >
              <Copy className="h-4 w-4" />
            </button>
            {copied === 'address' && (
              <span className="text-green-500 text-sm">Copied!</span>
            )}
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 bg-avail-600 text-white rounded hover:bg-avail-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Balance */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Balance
            </h3>
            <Wallet className="h-4 w-4 text-avail-600" />
          </div>
          <div className="text-2xl font-bold text-avail-600">
            {formatBalance(account.accountInfo.free)} AVAIL
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            ≈ $
            {(parseFloat(formatBalance(account.accountInfo.free)) * 0.15).toFixed(
              2
            )}{' '}
            USD
          </div>
        </div>

        {/* Reserved Balance */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Reserved
            </h3>
            <Shield className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {formatBalance(account.accountInfo.reserved)} AVAIL
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Locked for staking/governance
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Transactions
            </h3>
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">N/A</div>
          <div className="text-sm text-muted-foreground mt-1">
            Requires API integration
          </div>
        </div>

        {/* Staking Rewards */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Staking Rewards
            </h3>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">N/A</div>
          <div className="text-sm text-muted-foreground mt-1">
            Requires API integration
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-avail-600 text-avail-600'
                  : 'border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-avail-600 text-avail-600'
                  : 'border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('staking')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'staking'
                  ? 'border-avail-600 text-avail-600'
                  : 'border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Staking
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Information */}
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">
                Account Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address:</span>
                  <span className="font-mono text-sm">
                    {formatAddress(address)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nonce:</span>
                  <span className="font-mono">{account.nonce}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">First Seen:</span>
                  <span>N/A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Activity:</span>
                  <span>N/A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Type:</span>
                  <span>N/A</span>
                </div>
              </div>
            </div>

            {/* Balance Chart */}
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Balance History</h3>
              <BalanceChart address={address} />
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
            <TransactionHistory address={address} />
          </div>
        )}

        {activeTab === 'staking' && (
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Staking Information</h3>
            <StakingInfo address={address} />
          </div>
        )}
      </div>
    </div>
  )
}
