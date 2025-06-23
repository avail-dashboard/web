'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Line, Bar, Chart } from 'react-chartjs-2'
import { TooltipItem } from 'chart.js'
import { formatTimeAgo } from '@/lib/utils'
import { createZoomableChartOptions, resetZoom, registerZoomPlugin } from '@/lib/chart-config'
import { useTheme } from '@/contexts/ThemeContext'
import { getAppIdColor, getThemeColors } from '@/lib/chart-themes'
import { ZoomIn, ZoomOut, RotateCcw, RefreshCw, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

// Types for new chart API
interface ChartDataPoint {
  timestamp: string
  value: number
  count: number
  success_rate?: number
  metadata?: {
    app_id?: string
    app_name?: string
    rollup_id?: string
    block_height?: number
    avg_submission_size?: number
  }
}

interface ChartApiResponse {
  data: ChartDataPoint[]
  summary: {
    total_data_volume: number
    total_submissions: number
    unique_applications: number
    success_rate: number
    period_growth: number
    time_range: {
      start: string
      end: string
    }
    block_range?: {
      start_block: number
      end_block: number
    }
  }
  metadata: {
    granularity: string
    metric_type: string
    group_by: string
    applied_filters: Record<string, any>
    data_points: number
    is_real_time: boolean
  }
}

interface ChartConfig {
  time_ranges: Array<{
    key: string
    name: string
    granularity: string
    description: string
  }>
  available_metrics: Array<{
    key: string
    name: string
    description: string
    unit: string
    chart_types: string[]
    is_primary: boolean
  }>
  chart_types: Array<{
    key: string
    name: string
    description: string
    recommended_for: string[]
  }>
  applications: Array<{
    app_id: string
    name: string
    submission_count: number
    last_active: string
  }>
}

interface EnhancedDataSubmissionsChartProps {
  className?: string
  height?: string
}

export function EnhancedDataSubmissionsChart({ 
  className = '',
  height = 'h-96'
}: EnhancedDataSubmissionsChartProps) {
  const { actualTheme } = useTheme()
  const themeColors = getThemeColors(actualTheme)
  const chartRef = useRef<any>(null)
  
  // State
  const [zoomEnabled, setZoomEnabled] = useState(false)
  const [chartData, setChartData] = useState<ChartApiResponse | null>(null)
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Chart controls state
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [selectedMetric, setSelectedMetric] = useState('data_volume')
  const [selectedChartType, setSelectedChartType] = useState('line')
  const [selectedApps, setSelectedApps] = useState<string[]>([])
  const [groupByApps, setGroupByApps] = useState(false)

  // Register zoom plugin
  useEffect(() => {
    registerZoomPlugin().then(setZoomEnabled)
  }, [])

  // Fetch chart configuration
  const fetchChartConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/data-submissions/charts/config')
      if (!response.ok) throw new Error(`Config fetch failed: ${response.status}`)
      
      const config = await response.json()
      setChartConfig(config)
      
      // Set defaults from config
      if (config.default_settings) {
        setSelectedTimeRange(config.default_settings.duration || '24h')
        setSelectedMetric(config.default_settings.metric_type || 'data_volume')
        setSelectedChartType(config.default_settings.chart_type || 'line')
      }
    } catch (err) {
      console.error('Failed to fetch chart config:', err)
      setError('Failed to load chart configuration')
    }
  }, [])

  // Fetch chart data
  const fetchChartData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        duration: selectedTimeRange,
        metric_type: selectedMetric,
        granularity: 'auto',
        group_by: groupByApps ? 'app_id' : 'time',
        limit: '3000'
      })
      
      // Add app filters if selected
      selectedApps.forEach(appId => {
        params.append('app_ids', appId)
      })

      const response = await fetch(`/api/data-submissions/charts/data?${params}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API error: ${response.status}`)
      }
      
      const data = await response.json()
      setChartData(data)
    } catch (err) {
      console.error('Failed to fetch chart data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load chart data')
    } finally {
      setLoading(false)
    }
  }, [selectedTimeRange, selectedMetric, selectedApps, groupByApps])

  // Load config on mount
  useEffect(() => {
    fetchChartConfig()
  }, [fetchChartConfig])

  // Load data when parameters change
  useEffect(() => {
    if (chartConfig) {
      fetchChartData()
    }
  }, [chartConfig, fetchChartData])

  // Format data size helper
  const formatDataSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format value based on metric type
  const formatValue = (value: number, unit: string): string => {
    switch (unit) {
      case 'bytes':
        return formatDataSize(value)
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`
      case 'count':
        return value.toLocaleString()
      case 'seconds':
        return `${value.toFixed(1)}s`
      default:
        return value.toLocaleString()
    }
  }

  // Get current metric config
  const currentMetric = chartConfig?.available_metrics.find(m => m.key === selectedMetric)
  const ChartComponent = selectedChartType === 'line' ? Line : Bar

  if (error) {
    return (
      <div className={`${height} flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="font-medium">Failed to load chart</p>
          <p className="text-sm">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchChartData}
            className="mt-3"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (loading || !chartData || !chartConfig) {
    return (
      <div className={`${height} flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p>Loading chart data...</p>
        </div>
      </div>
    )
  }

  if (!chartData.data.length) {
    return (
      <div className={`${height} flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-2">📊</div>
          <p className="font-medium">No data available</p>
          <p className="text-sm">Try adjusting the time range or filters</p>
        </div>
      </div>
    )
  }

  // Prepare chart data
  let chartLabels: string[]
  let datasets: any[]

  if (groupByApps) {
    // Group by App ID - create separate datasets for each app
    const appGroups: Record<string, ChartDataPoint[]> = {}
    chartData.data.forEach(point => {
      const appId = point.metadata?.app_id || 'Unknown'
      if (!appGroups[appId]) appGroups[appId] = []
      appGroups[appId].push(point)
    })

    // Use timestamp as labels (time is still important even when grouping by app)
    const uniqueLabels = new Set(chartData.data.map(point => {
      const date = new Date(point.timestamp)
      if (selectedTimeRange === '1h' || selectedTimeRange === '6h') {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } else if (selectedTimeRange === '24h') {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      }
    }))
    chartLabels = Array.from(uniqueLabels).sort()

    // Create a dataset for each app
    datasets = Object.entries(appGroups).map(([appId, points], index) => {
      const appInfo = chartConfig?.applications.find(app => app.app_id === appId)
      const color = getAppIdColor(parseInt(appId) || index, actualTheme)
      
      return {
        label: appInfo?.name || `App ${appId}`,
        data: chartLabels.map(label => {
          const point = points.find(p => {
            const date = new Date(p.timestamp)
            const pointLabel = selectedTimeRange === '1h' || selectedTimeRange === '6h'
              ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : selectedTimeRange === '24h'
              ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : date.toLocaleDateString([], { month: 'short', day: 'numeric' })
            return pointLabel === label
          })
          return point?.value || 0
        }),
        backgroundColor: selectedChartType === 'line' ? `${color}20` : color,
        borderColor: color,
        borderWidth: 2,
        tension: 0.4,
        fill: selectedChartType === 'line',
        pointBackgroundColor: color,
        pointBorderColor: themeColors.background,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    })
  } else {
    // Group by time - single dataset
    chartLabels = chartData.data.map(point => {
      const date = new Date(point.timestamp)
      if (selectedTimeRange === '1h' || selectedTimeRange === '6h') {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } else if (selectedTimeRange === '24h') {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      }
    })

    datasets = [{
      label: currentMetric?.name || selectedMetric,
      data: chartData.data.map(point => point.value),
      backgroundColor: selectedChartType === 'line' 
        ? `${themeColors.primary}20`
        : themeColors.primary,
      borderColor: themeColors.primary,
      borderWidth: 2,
      tension: 0.4,
      fill: selectedChartType === 'line',
      pointBackgroundColor: themeColors.primary,
      pointBorderColor: themeColors.background,
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  }

  const baseOptions = createZoomableChartOptions(selectedChartType as any)
  const options = {
    ...baseOptions,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      ...baseOptions.plugins,
      title: {
        display: false,
      },
      legend: {
        display: groupByApps, // Show legend when grouping by apps
        position: 'bottom' as const,
        labels: {
          color: themeColors.foreground,
          font: { size: 11 },
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: actualTheme === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: themeColors.foreground,
        bodyColor: themeColors.foreground,
        borderColor: themeColors.border,
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          title: function(context: TooltipItem<any>[]) {
            const dataIndex = context[0]?.dataIndex
            if (dataIndex !== undefined && chartData.data[dataIndex]) {
              const timestamp = chartData.data[dataIndex].timestamp
              const date = new Date(timestamp)
              return date.toLocaleString()
            }
            return ''
          },
          label: function(context: TooltipItem<any>) {
            const value = context.parsed.y
            const unit = currentMetric?.unit || ''
            return `${currentMetric?.name || selectedMetric}: ${formatValue(value, unit)}`
          },
          afterBody: function(context: TooltipItem<any>[]) {
            const dataIndex = context[0]?.dataIndex
            if (dataIndex !== undefined && chartData.data[dataIndex]) {
              const point = chartData.data[dataIndex]
              const lines = []
              if (point.count) lines.push(`Submissions: ${point.count.toLocaleString()}`)
              if (point.success_rate) lines.push(`Success Rate: ${(point.success_rate * 100).toFixed(1)}%`)
              if (point.metadata?.block_height) lines.push(`Block: #${point.metadata.block_height.toLocaleString()}`)
              return lines
            }
            return []
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
          color: themeColors.foreground,
        },
        ticks: {
          color: themeColors.foreground,
          maxRotation: 45,
        },
        grid: {
          color: themeColors.grid,
        },
        border: {
          color: themeColors.border,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: currentMetric?.name || selectedMetric,
          color: themeColors.foreground,
        },
        ticks: {
          color: themeColors.foreground,
          callback: function(value: number | string) {
            return formatValue(Number(value), currentMetric?.unit || '')
          },
        },
        grid: {
          color: themeColors.grid,
        },
        border: {
          color: themeColors.border,
        },
      }
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Chart Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {chartConfig.time_ranges.map(range => (
                <SelectItem key={range.key} value={range.key}>
                  {range.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Metric:</span>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {chartConfig.available_metrics.map(metric => (
                <SelectItem key={metric.key} value={metric.key}>
                  {metric.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Chart:</span>
          <Select value={selectedChartType} onValueChange={setSelectedChartType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {chartConfig.chart_types
                .filter(type => currentMetric?.chart_types.includes(type.key))
                .map(type => (
                  <SelectItem key={type.key} value={type.key}>
                    {type.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Group by:</span>
          <Select value={groupByApps ? 'app_id' : 'time'} onValueChange={(value) => setGroupByApps(value === 'app_id')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Time</SelectItem>
              <SelectItem value="app_id">App ID</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {chartConfig.applications && chartConfig.applications.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Apps:</span>
            <Select value={selectedApps.length > 0 ? selectedApps[0] : 'all'} onValueChange={(value) => {
              setSelectedApps(value === 'all' ? [] : [value])
            }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Apps" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Apps</SelectItem>
                {chartConfig.applications.map(app => (
                  <SelectItem key={app.app_id} value={app.app_id}>
                    {app.name || `App ${app.app_id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchChartData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Chart Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="text-sm text-muted-foreground">Total Volume</div>
          <div className="text-lg font-semibold">
            {formatDataSize(chartData.summary.total_data_volume)}
          </div>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="text-sm text-muted-foreground">Submissions</div>
          <div className="text-lg font-semibold">
            {chartData.summary.total_submissions.toLocaleString()}
          </div>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="text-sm text-muted-foreground">Success Rate</div>
          <div className="text-lg font-semibold">
            {(chartData.summary.success_rate * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="text-sm text-muted-foreground">Growth</div>
          <div className="text-lg font-semibold text-green-600">
            +{(chartData.summary.period_growth * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      {zoomEnabled && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => chartRef.current?.zoom(1.1)}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => chartRef.current?.zoom(0.9)}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => resetZoom(chartRef)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Mouse wheel to zoom • Drag to pan
          </div>
        </div>
      )}

      {/* Chart */}
      <div className={height}>
        <ChartComponent 
          ref={chartRef} 
          data={{ labels: chartLabels, datasets }} 
          options={options} 
        />
      </div>

      {/* Chart Metadata */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">
          {chartData.metadata.data_points} data points
        </Badge>
        <Badge variant="outline">
          {chartData.metadata.granularity} intervals
        </Badge>
        {chartData.metadata.is_real_time && (
          <Badge variant="outline" className="text-green-600">
            Real-time
          </Badge>
        )}
        <span>
          {new Date(chartData.summary.time_range.start).toLocaleString()} - 
          {new Date(chartData.summary.time_range.end).toLocaleString()}
        </span>
      </div>
    </div>
  )
}