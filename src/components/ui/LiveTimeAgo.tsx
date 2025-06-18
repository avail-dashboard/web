'use client'

import { useState, useEffect } from 'react'
import { formatTimeAgo } from '@/lib/utils'

interface LiveTimeAgoProps {
  timestamp: number | string
  className?: string
}

export function LiveTimeAgo({ timestamp, className }: LiveTimeAgoProps) {
  const [timeDisplay, setTimeDisplay] = useState(() => formatTimeAgo(timestamp))

  useEffect(() => {
    // Update immediately
    setTimeDisplay(formatTimeAgo(timestamp))

    // Set up interval to update every second
    const interval = setInterval(() => {
      setTimeDisplay(formatTimeAgo(timestamp))
    }, 1000)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [timestamp])

  return <span className={className}>{timeDisplay}</span>
}