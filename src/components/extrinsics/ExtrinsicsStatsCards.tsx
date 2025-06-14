'use client'

import { Activity, CheckCircle, Hash, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatFee } from '@/lib/utils/extrinsicFormatters'

interface ExtrinsicsStatsProps {
  stats: {
    successRate: number
    averageFee: number
    uniqueMethods: number
    methodBreakdown: Record<string, number>
  }
  isLoading?: boolean
}

export function ExtrinsicsStatsCards({ stats, isLoading }: ExtrinsicsStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const topMethods = Object.entries(stats.methodBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {stats.successRate >= 95 ? 'Excellent' : 
             stats.successRate >= 90 ? 'Good' : 'Needs attention'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Fee</CardTitle>
          <Hash className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatFee(stats.averageFee)} AVAIL</div>
          <p className="text-xs text-muted-foreground">Per transaction</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Methods</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.uniqueMethods}</div>
          <p className="text-xs text-muted-foreground">Different call types</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Methods</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {topMethods.map(([method, count]) => (
              <div key={method} className="text-xs">
                <span className="font-medium">{method}:</span> {count}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}