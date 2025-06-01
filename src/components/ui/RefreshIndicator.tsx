import React from 'react'

interface RefreshIndicatorProps {
  isRefreshing: boolean
  text?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function RefreshIndicator({
  isRefreshing,
  text = 'Updating...',
  size = 'sm',
  className = '',
}: RefreshIndicatorProps) {
  if (!isRefreshing) return null

  const sizeClasses = {
    sm: 'w-3 h-3 text-xs',
    md: 'w-4 h-4 text-sm',
    lg: 'w-5 h-5 text-base',
  }

  return (
    <div
      className={`text-blue-500 bg-blue-50 px-2 py-1 rounded flex items-center space-x-1 ${className}`}
    >
      <div
        className={`${sizeClasses[size].split(' ').slice(0, 2).join(' ')} border border-blue-500 border-t-transparent rounded-full animate-spin`}
      ></div>
      <span className={sizeClasses[size].split(' ').slice(2).join(' ')}>
        {text}
      </span>
    </div>
  )
}
