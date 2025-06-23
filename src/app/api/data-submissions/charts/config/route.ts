import { NextResponse } from 'next/server'

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET() {
  try {
    // Try to fetch from backend first
    if (BACKEND_API_URL) {
      const backendUrl = `${BACKEND_API_URL}/data-submissions/charts/config`
      console.log('🔄 Fetching chart config from backend URL:', backendUrl)

      try {
        const backendResponse = await fetch(backendUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000),
        })

        if (backendResponse.ok) {
          const data = await backendResponse.json()
          console.log('✅ Backend chart config received')
          return NextResponse.json(data)
        }
      } catch (backendError) {
        console.log('⚠️ Backend not available for chart config, using fallback')
      }
    }

    // Fallback configuration data
    const configData = {
      applications: [
        {
          app_id: "0x123abc",
          name: "Example DApp",
          submission_count: 1000,
          last_active: new Date(Date.now() - 60000).toISOString()
        },
        {
          app_id: "0x456def",
          name: "DA Protocol",
          submission_count: 750,
          last_active: new Date(Date.now() - 300000).toISOString()
        },
        {
          app_id: "0x789ghi",
          name: "Rollup Service",
          submission_count: 500,
          last_active: new Date(Date.now() - 600000).toISOString()
        }
      ],
      rollups: [
        {
          rollup_id: "arbitrum_1",
          name: "Arbitrum One",
          submission_count: 500
        },
        {
          rollup_id: "optimism_1", 
          name: "Optimism",
          submission_count: 300
        },
        {
          rollup_id: "polygon_zkevm",
          name: "Polygon zkEVM",
          submission_count: 200
        }
      ],
      size_ranges: {
        small: { min: 0, max: 1024, label: "< 1 KB" },
        medium: { min: 1024, max: 1048576, label: "1 KB - 1 MB" },
        large: { min: 1048576, max: null, label: "> 1 MB" }
      },
      available_metrics: [
        {
          key: "data_volume",
          name: "Data Volume",
          description: "Total bytes of data submitted to Avail DA",
          unit: "bytes",
          chart_types: ["line", "area", "bar"],
          is_primary: true
        },
        {
          key: "submission_count",
          name: "Submission Count", 
          description: "Number of data submissions",
          unit: "count",
          chart_types: ["line", "bar"],
          is_primary: true
        },
        {
          key: "success_rate",
          name: "Success Rate",
          description: "Percentage of successful submissions",
          unit: "percentage",
          chart_types: ["line", "area"],
          is_primary: false
        },
        {
          key: "avg_size",
          name: "Average Size",
          description: "Average submission size",
          unit: "bytes", 
          chart_types: ["line", "area"],
          is_primary: false
        },
        {
          key: "block_utilization",
          name: "Block Utilization",
          description: "Percentage of block space used for DA",
          unit: "percentage",
          chart_types: ["line", "area"],
          is_primary: false
        },
        {
          key: "unique_apps",
          name: "Unique Applications",
          description: "Number of unique applications submitting data",
          unit: "count",
          chart_types: ["line", "bar"],
          is_primary: false
        },
        {
          key: "avg_block_time",
          name: "Average Block Time",
          description: "Average time between blocks",
          unit: "seconds",
          chart_types: ["line"],
          is_primary: false
        }
      ],
      time_ranges: [
        { 
          key: "1h", 
          name: "1 Hour", 
          granularity: "5min",
          description: "Last hour with 5-minute intervals"
        },
        { 
          key: "6h", 
          name: "6 Hours", 
          granularity: "15min",
          description: "Last 6 hours with 15-minute intervals"
        },
        { 
          key: "24h", 
          name: "24 Hours", 
          granularity: "hour",
          description: "Last 24 hours with hourly intervals"
        },
        { 
          key: "7d", 
          name: "7 Days", 
          granularity: "hour",
          description: "Last 7 days with hourly intervals"
        },
        { 
          key: "30d", 
          name: "30 Days", 
          granularity: "day",
          description: "Last 30 days with daily intervals"
        },
        { 
          key: "90d", 
          name: "90 Days", 
          granularity: "day",
          description: "Last 90 days with daily intervals"
        },
        {
          key: "custom",
          name: "Custom Range",
          granularity: "auto",
          description: "Custom date range with automatic granularity"
        }
      ],
      group_by_options: [
        {
          key: "time",
          name: "Time",
          description: "Group data by time intervals"
        },
        {
          key: "app_id", 
          name: "Application",
          description: "Group data by application ID"
        },
        {
          key: "rollup_id",
          name: "Rollup",
          description: "Group data by rollup identifier"
        },
        {
          key: "size_range",
          name: "Size Range", 
          description: "Group data by submission size ranges"
        }
      ],
      chart_types: [
        {
          key: "line",
          name: "Line Chart",
          description: "Best for time series data",
          recommended_for: ["data_volume", "submission_count", "success_rate"]
        },
        {
          key: "area",
          name: "Area Chart", 
          description: "Emphasizes volume over time",
          recommended_for: ["data_volume", "block_utilization"]
        },
        {
          key: "bar",
          name: "Bar Chart",
          description: "Good for comparing discrete values",
          recommended_for: ["submission_count", "unique_apps"]
        },
        {
          key: "stacked_bar",
          name: "Stacked Bar Chart",
          description: "Compare multiple metrics in categories",
          recommended_for: ["grouped comparisons"]
        }
      ],
      default_settings: {
        duration: "24h",
        granularity: "auto",
        metric_type: "data_volume",
        group_by: "time",
        chart_type: "line",
        success_only: false,
        limit: 1000
      },
      limits: {
        max_data_points: 5000,
        max_time_range_days: 365,
        max_apps_filter: 50,
        max_rollups_filter: 20
      },
      meta: {
        source: BACKEND_API_URL ? 'fallback' : 'static',
        last_updated: new Date().toISOString(),
        api_version: "1.0.0"
      }
    }

    return NextResponse.json(configData)
  } catch (error) {
    console.error('❌ Chart config API error:', error)

    return NextResponse.json(
      {
        error: {
          code: 'CONFIG_ERROR',
          message: 'Failed to fetch chart configuration',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}