// Utility functions for formatting extrinsic data

// Format timestamp to relative time
export const formatTimeAgo = (timestamp: string | number) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

// Format fee amount
export const formatFee = (fee: string | number) => {
  const feeNum = typeof fee === 'string' ? parseFloat(fee) : fee
  if (feeNum === 0) return '0'
  return (feeNum / 1e18).toFixed(6)
}

// Get color for method section
export const getMethodColor = (module: string) => {
  const colors: Record<string, string> = {
    timestamp: 'bg-blue-100 text-blue-800',
    balances: 'bg-green-100 text-green-800',
    system: 'bg-gray-100 text-gray-800',
    staking: 'bg-purple-100 text-purple-800',
    dataAvailability: 'bg-orange-100 text-orange-800',
    vector: 'bg-red-100 text-red-800',
  }
  return colors[module] || 'bg-gray-100 text-gray-800'
}

// Calculate extrinsic stats
export const calculateExtrinsicStats = (extrinsics: any[]) => {
  if (!extrinsics || extrinsics.length === 0) {
    return {
      successRate: 0,
      averageFee: 0,
      uniqueMethods: 0,
      methodBreakdown: {},
    }
  }

  const successful = extrinsics.filter(ext => ext.success).length
  const successRate = (successful / extrinsics.length) * 100

  const totalFees = extrinsics.reduce((sum, ext) => {
    if (ext.fee !== undefined && ext.fee !== null) {
      return (
        sum + (typeof ext.fee === 'string' ? parseFloat(ext.fee) : ext.fee)
      )
    }
    return sum
  }, 0)
  const averageFee = totalFees / extrinsics.length

  const methods = new Set(
    extrinsics
      .filter(ext => ext.module && ext.call)
      .map(ext => `${ext.module}.${ext.call}`)
  )
  const uniqueMethods = methods.size

  const methodBreakdown = extrinsics.reduce(
    (acc, ext) => {
      const key = ext.module
      if (key) {
        acc[key] = (acc[key] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>
  )

  return { successRate, averageFee, uniqueMethods, methodBreakdown }
}