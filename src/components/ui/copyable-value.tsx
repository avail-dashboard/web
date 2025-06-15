import React from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCopyToClipboard } from '@/lib/hooks/useCopyToClipboard'

interface CopyableValueProps {
  /** The value to copy to clipboard */
  value: string
  /** The value to display (if different from copy value) */
  displayValue?: string
  /** Whether to truncate long values */
  truncate?: boolean
  /** Number of characters to show at start when truncating */
  truncateStart?: number
  /** Number of characters to show at end when truncating */
  truncateEnd?: number
  /** Additional CSS classes for the container */
  className?: string
  /** Additional CSS classes for the value text */
  valueClassName?: string
  /** Whether to show copy button always or only on hover */
  showCopyButton?: 'hover' | 'always'
  /** Size of the copy button */
  buttonSize?: 'sm' | 'md'
  /** Whether the value should be displayed as monospace */
  monospace?: boolean
  /** Custom tooltip text for the copy button */
  copyTooltip?: string
}

export function CopyableValue({
  value,
  displayValue,
  truncate = false,
  truncateStart = 8,
  truncateEnd = 8,
  className,
  valueClassName,
  showCopyButton = 'hover',
  buttonSize = 'sm',
  monospace = true,
  copyTooltip = 'Copy to clipboard',
}: CopyableValueProps) {
  const { copied, copyToClipboard } = useCopyToClipboard()

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await copyToClipboard(value)
  }

  const getDisplayValue = () => {
    const textToDisplay = displayValue || value
    if (truncate && textToDisplay.length > truncateStart + truncateEnd + 3) {
      return `${textToDisplay.slice(0, truncateStart)}...${textToDisplay.slice(-truncateEnd)}`
    }
    return textToDisplay
  }

  const buttonSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
  }

  const containerClasses = cn(
    'group inline-flex items-center gap-1 max-w-full',
    className
  )

  const valueClasses = cn(
    'truncate',
    monospace && 'font-mono',
    valueClassName
  )

  const buttonClasses = cn(
    'flex-shrink-0 p-1 rounded transition-colors',
    'hover:bg-muted focus:bg-muted focus:outline-none',
    showCopyButton === 'hover' && 'opacity-0 group-hover:opacity-100',
    'focus:opacity-100' // Always show on keyboard focus for accessibility
  )

  return (
    <div className={containerClasses}>
      <span className={valueClasses} title={value}>
        {getDisplayValue()}
      </span>
      <button
        onClick={handleCopy}
        className={buttonClasses}
        title={copyTooltip}
        aria-label={copyTooltip}
        type="button"
      >
        {copied ? (
          <Check className={cn(buttonSizeClasses[buttonSize], 'text-green-600')} />
        ) : (
          <Copy className={cn(buttonSizeClasses[buttonSize], 'text-muted-foreground')} />
        )}
      </button>
      {copied && showCopyButton === 'always' && (
        <span className="text-xs text-green-600 ml-1">Copied!</span>
      )}
    </div>
  )
} 