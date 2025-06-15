import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format large numbers with appropriate suffixes
export function formatNumber(
  num: number | string,
  decimals: number = 2
): string {
  const n = typeof num === 'string' ? parseFloat(num) : num

  if (isNaN(n)) return '0'

  if (n >= 1e9) {
    return (n / 1e9).toFixed(decimals) + 'B'
  }
  if (n >= 1e6) {
    return (n / 1e6).toFixed(decimals) + 'M'
  }
  if (n >= 1e3) {
    return (n / 1e3).toFixed(decimals) + 'K'
  }

  return n.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

// Format token amounts
export function formatTokenAmount(
  amount: string | number,
  decimals: number = 18,
  displayDecimals: number = 4
): string {
  const num =
    typeof amount === 'string' ? BigInt(amount) : BigInt(Math.floor(amount))
  const divisor = BigInt(10 ** decimals)
  const quotient = num / divisor
  const remainder = num % divisor

  const wholeString = quotient.toString()
  const remainderString = remainder.toString().padStart(decimals, '0')
  const decimalString = remainderString
    .substring(0, displayDecimals)
    .replace(/0+$/, '')

  return decimalString ? `${wholeString}.${decimalString}` : wholeString
}

// Format addresses for display
export function formatAddress(address: string, chars: number = 6): string {
  if (!address) return ''
  if (address.length <= chars * 2) return address
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

// Format time ago - handles both ISO strings and millisecond timestamps
export function formatTimeAgo(timestamp: number | string): string {
  const now = Date.now()
  let time: number

  if (typeof timestamp === 'string') {
    // First try to parse as a number (for numeric strings like "1234567890")
    const numericTimestamp = parseInt(timestamp, 10)
    if (!isNaN(numericTimestamp) && numericTimestamp.toString() === timestamp) {
      time = numericTimestamp
    } else {
      // Handle ISO string timestamps (e.g., "2024-01-20T10:25:30.000Z")
      time = new Date(timestamp).getTime()
    }
  } else {
    // Handle numeric timestamps (milliseconds)
    time = timestamp
  }

  // Validate the timestamp
  if (isNaN(time)) {
    return 'Invalid date'
  }

  const diff = now - time
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  if (seconds >= 0) return `${seconds}s ago`
  
  // Handle future timestamps
  return 'just now'
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`
}

// Generate random color for charts
export function generateColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = hash % 360
  return `hsl(${hue}, 70%, 50%)`
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    return false
  }
}

// Format block number
export function formatBlockNumber(blockNumber: number): string {
  return `#${blockNumber.toLocaleString()}`
}

// Calculate percentage change
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}
