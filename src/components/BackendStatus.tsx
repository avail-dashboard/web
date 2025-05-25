'use client'

import { useState, useEffect } from 'react'
import { useBackendStatus } from '@/lib/hooks/useAvailAPI'

interface HealthStatus {
  status: string
  frontend: {
    status: string
    timestamp: string
    version: string
  }
  backend: {
    status: string
    available: boolean
    url: string
    error: string | null
  }
  services: {
    websocket: boolean
    caching: boolean
    database: boolean
  }
}

export function BackendStatus({ 
  showDetails = false, 
  className = "" 
}: { 
  showDetails?: boolean
  className?: string 
}) {
  const { isConnected, lastChecked, checkStatus } = useBackendStatus()
  const [healthData, setHealthData] = useState<HealthStatus | null>(null)
  const [expanded, setExpanded] = useState(false)

  // Fetch detailed health information
  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealthData(data)
    } catch (error) {
      console.error('Failed to fetch health data:', error)
    }
  }

  useEffect(() => {
    if (showDetails) {
      fetchHealth()
      const interval = setInterval(fetchHealth, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [showDetails])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'connected':
        return 'text-green-500'
      case 'degraded':
      case 'warning':
        return 'text-yellow-500'
      case 'unhealthy':
      case 'error':
      case 'unreachable':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? '🟢' : '🔴'
    }
    
    switch (status.toLowerCase()) {
      case 'healthy':
        return '🟢'
      case 'degraded':
        return '🟡'
      case 'unhealthy':
      case 'unreachable':
        return '🔴'
      default:
        return '⚪'
    }
  }

  if (!showDetails) {
    // Simple status indicator
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
          {isConnected ? 'Backend Connected' : 'Backend Offline'}
        </span>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">System Status</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {expanded ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {/* Overall Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Status</span>
          <div className="flex items-center space-x-2">
            <span>{getStatusIcon(healthData?.status || 'unknown')}</span>
            <span className={`text-sm ${getStatusColor(healthData?.status || 'unknown')}`}>
              {healthData?.status || 'Checking...'}
            </span>
          </div>
        </div>

        {/* Backend Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Backend API</span>
          <div className="flex items-center space-x-2">
            <span>{getStatusIcon(isConnected)}</span>
            <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>

        {expanded && healthData && (
          <>
            {/* Services Status */}
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Services</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Database</span>
                  <div className="flex items-center space-x-2">
                    <span>{getStatusIcon(healthData.services.database)}</span>
                    <span className={healthData.services.database ? 'text-green-600' : 'text-red-600'}>
                      {healthData.services.database ? 'Connected' : 'Offline'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Cache (Redis)</span>
                  <div className="flex items-center space-x-2">
                    <span>{getStatusIcon(healthData.services.caching)}</span>
                    <span className={healthData.services.caching ? 'text-green-600' : 'text-red-600'}>
                      {healthData.services.caching ? 'Connected' : 'Offline'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>WebSocket</span>
                  <div className="flex items-center space-x-2">
                    <span>{getStatusIcon(healthData.services.websocket)}</span>
                    <span className={healthData.services.websocket ? 'text-green-600' : 'text-red-600'}>
                      {healthData.services.websocket ? 'Available' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Information */}
            {healthData.backend.error && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Error Details</h4>
                <div className="bg-red-50 border border-red-200 rounded p-2">
                  <p className="text-sm text-red-700">{healthData.backend.error}</p>
                </div>
              </div>
            )}

            {/* Configuration Info */}
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Configuration</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Backend URL: {healthData.backend.url}</div>
                <div>Frontend Version: {healthData.frontend.version}</div>
                <div>Last Checked: {lastChecked.toLocaleTimeString()}</div>
              </div>
            </div>

            {/* Refresh Button */}
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  checkStatus()
                  fetchHealth()
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Refresh Status
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Quick status badge for headers/navigation
export function StatusBadge({ className = "" }: { className?: string }) {
  const { isConnected } = useBackendStatus()

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-xs text-gray-600">
        {isConnected ? 'Online' : 'Offline'}
      </span>
    </div>
  )
} 