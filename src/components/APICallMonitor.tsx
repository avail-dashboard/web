'use client'

import { useState, useEffect } from 'react'

interface APICallStats {
  totalCalls: number
  activeCalls: number
  pendingCalls: number
  lastCallTime: Date | null
}

export function APICallMonitor() {
  const [stats, setStats] = useState<APICallStats>({
    totalCalls: 0,
    activeCalls: 0,
    pendingCalls: 0,
    lastCallTime: null,
  })

  useEffect(() => {
    // Monitor fetch calls
    const originalFetch = window.fetch

    window.fetch = async (...args) => {
      setStats(prev => ({
        ...prev,
        totalCalls: prev.totalCalls + 1,
        activeCalls: prev.activeCalls + 1,
        lastCallTime: new Date(),
      }))

      try {
        const response = await originalFetch(...args)
        setStats(prev => ({
          ...prev,
          activeCalls: Math.max(0, prev.activeCalls - 1),
        }))
        return response
      } catch (error) {
        setStats(prev => ({
          ...prev,
          activeCalls: Math.max(0, prev.activeCalls - 1),
        }))
        throw error
      }
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  const resetStats = () => {
    setStats({
      totalCalls: 0,
      activeCalls: 0,
      pendingCalls: 0,
      lastCallTime: null,
    })
  }

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-3 rounded text-xs font-mono z-50">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold">API Monitor</span>
        <button
          onClick={resetStats}
          className="ml-2 px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700"
        >
          Reset
        </button>
      </div>
      <div className="space-y-1">
        <div>Total: {stats.totalCalls}</div>
        <div
          className={`${stats.activeCalls > 5 ? 'text-red-400' : 'text-green-400'}`}
        >
          Active: {stats.activeCalls}
        </div>
        {stats.lastCallTime && (
          <div className="text-gray-400">
            Last: {stats.lastCallTime.toLocaleTimeString()}
          </div>
        )}
      </div>
      {stats.activeCalls > 10 && (
        <div className="text-red-400 font-bold mt-2">⚠️ High API load!</div>
      )}
    </div>
  )
}
