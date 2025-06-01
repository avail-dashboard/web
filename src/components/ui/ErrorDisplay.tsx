import React from 'react'
import {
  AlertCircle,
  RefreshCw,
  Wifi,
  Server,
  Clock,
  Search,
} from 'lucide-react'

export interface ErrorInfo {
  type: 'timeout' | 'network' | 'notfound' | 'server' | 'api' | 'generic'
  title: string
  message: string
  suggestion: string
}

interface ErrorDisplayProps {
  error: Error | null
  onRetry?: () => void
  className?: string
  compact?: boolean
  showIcon?: boolean
}

export function categorizeError(error: Error | null): ErrorInfo | null {
  if (!error) return null

  const errorMessage = error.message || 'Unknown error occurred'

  // Categorize error types for better user experience
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('ECONNABORTED')
  ) {
    return {
      type: 'timeout',
      title: 'Request Timeout',
      message: 'The server is taking too long to respond.',
      suggestion: 'Check your internet connection or try refreshing the page.',
    }
  }

  if (
    errorMessage.includes('Network Error') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('Connection refused')
  ) {
    return {
      type: 'network',
      title: 'Connection Failed',
      message: 'Unable to connect to the Avail network.',
      suggestion: 'The backend service may be offline. Please try again later.',
    }
  }

  if (
    errorMessage.includes('404') ||
    errorMessage.includes('Not Found') ||
    errorMessage.includes('Data not found')
  ) {
    return {
      type: 'notfound',
      title: 'Data Not Found',
      message: 'The requested data could not be found.',
      suggestion: 'The blockchain data may not be available yet.',
    }
  }

  if (
    errorMessage.includes('500') ||
    errorMessage.includes('Internal Server Error') ||
    errorMessage.includes('Server error')
  ) {
    return {
      type: 'server',
      title: 'Server Error',
      message: 'The server encountered an internal error.',
      suggestion: 'Please try again in a few moments.',
    }
  }

  if (
    errorMessage.includes('503') ||
    errorMessage.includes('Service unavailable')
  ) {
    return {
      type: 'server',
      title: 'Service Unavailable',
      message: 'The backend service is temporarily offline.',
      suggestion: 'Please try again in a few minutes.',
    }
  }

  if (
    errorMessage.includes('API request failed') ||
    errorMessage.includes('API Error')
  ) {
    return {
      type: 'api',
      title: 'API Error',
      message: 'Failed to fetch data from the blockchain.',
      suggestion: 'The RPC node may be experiencing issues. Try refreshing.',
    }
  }

  // Generic error fallback
  return {
    type: 'generic',
    title: 'Data Loading Error',
    message: errorMessage,
    suggestion: 'Please try refreshing the page or check back later.',
  }
}

const getErrorIcon = (type: ErrorInfo['type']) => {
  switch (type) {
    case 'timeout':
      return Clock
    case 'network':
      return Wifi
    case 'notfound':
      return Search
    case 'server':
    case 'api':
      return Server
    default:
      return AlertCircle
  }
}

const getErrorColors = (type: ErrorInfo['type']) => {
  switch (type) {
    case 'timeout':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-700',
        icon: 'text-yellow-500',
      }
    case 'network':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        icon: 'text-orange-500',
      }
    case 'notfound':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: 'text-blue-500',
      }
    default:
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: 'text-red-500',
      }
  }
}

export function ErrorDisplay({
  error,
  onRetry,
  className = '',
  compact = false,
  showIcon = true,
}: ErrorDisplayProps) {
  const errorInfo = categorizeError(error)

  if (!errorInfo) return null

  const Icon = getErrorIcon(errorInfo.type)
  const colors = getErrorColors(errorInfo.type)

  if (compact) {
    return (
      <div className={`group relative ${className}`}>
        <div
          className={`text-xs ${colors.text} ${colors.bg} px-2 py-1 rounded cursor-help ${colors.border} border`}
        >
          {errorInfo.title}
        </div>
        {/* Enhanced error tooltip */}
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {showIcon && <Icon className={`w-4 h-4 ${colors.icon}`} />}
              <h4 className={`font-semibold ${colors.text}`}>
                {errorInfo.title}
              </h4>
            </div>
            <p className="text-sm text-gray-700">{errorInfo.message}</p>
            <p className="text-xs text-gray-500 italic">
              {errorInfo.suggestion}
            </p>
            {onRetry && (
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={onRetry}
                  className={`text-xs ${colors.text} border ${colors.border} px-2 py-1 rounded hover:bg-gray-50 transition-colors flex items-center space-x-1`}
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${colors.bg} ${colors.border} border rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start space-x-3">
        {showIcon && (
          <Icon className={`w-5 h-5 ${colors.icon} mt-0.5 flex-shrink-0`} />
        )}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${colors.text} mb-1`}>
            {errorInfo.title}
          </h3>
          <p className={`text-sm ${colors.text} mb-2`}>{errorInfo.message}</p>
          <p className="text-xs text-gray-600 italic mb-3">
            {errorInfo.suggestion}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className={`inline-flex items-center space-x-2 text-sm ${colors.text} border ${colors.border} px-3 py-1 rounded hover:bg-white/50 transition-colors`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
