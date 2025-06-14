'use client'

import React from 'react'

interface RefreshIndicatorProps {
  isRefreshing: boolean
}

export const RefreshIndicator = React.memo<RefreshIndicatorProps>(({ isRefreshing }) => {
  if (!isRefreshing) return null

  return (
    <div className="flex items-center space-x-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-avail-600"></div>
      <span className="text-xs text-muted-foreground">Refreshing...</span>
    </div>
  )
})

RefreshIndicator.displayName = 'RefreshIndicator' 