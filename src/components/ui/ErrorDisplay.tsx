'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface ErrorDisplayProps {
  error: Error | string
  onRetry?: () => void
  compact?: boolean
}

export const ErrorDisplay = React.memo<ErrorDisplayProps>(({ 
  error, 
  onRetry, 
  compact = false 
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message

  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
        <span>Error: {errorMessage}</span>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="underline hover:no-underline"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Something went wrong
          </h3>
          <div className="mt-2 text-sm text-red-700">
            {errorMessage}
          </div>
          {onRetry && (
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="text-red-800 border-red-300 hover:bg-red-100"
              >
                Try again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

ErrorDisplay.displayName = 'ErrorDisplay' 