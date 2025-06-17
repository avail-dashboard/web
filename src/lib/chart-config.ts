// Centralized Chart.js configuration for consistent styling and optimal bundle size
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'

// Register all Chart.js components used across the app in one place
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
)

// Common chart options for consistency
export const createBaseChartOptions = (type: 'bar' | 'line' | 'doughnut') => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: type === 'doughnut' ? 'bottom' : 'top',
      labels: {
        padding: 20,
        usePointStyle: true,
        font: {
          size: 11,
        },
      },
    } as const,
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1f2937',
      bodyColor: '#374151',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      padding: 12,
    },
  },
  animation: {
    duration: 750,
    easing: 'easeInOutQuart' as const,
  },
})

// Enhanced chart options with zoom/pan functionality
export const createZoomableChartOptions = (type: 'bar' | 'line' | 'doughnut') => ({
  ...createBaseChartOptions(type),
  plugins: {
    ...createBaseChartOptions(type).plugins,
    zoom: {
      zoom: {
        wheel: {
          enabled: true,
          speed: 0.1,
        },
        pinch: {
          enabled: true
        },
        mode: type === 'line' ? 'xy' as const : 'x' as const,
        drag: {
          enabled: true,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          borderWidth: 1,
        }
      },
      pan: {
        enabled: true,
        mode: type === 'line' ? 'xy' as const : 'x' as const,
        threshold: 10,
      },
      limits: {
        x: {min: 'original' as const, max: 'original' as const},
        y: {min: 'original' as const, max: 'original' as const}
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index' as const,
  }
})

// Reset zoom function for components
export const resetZoom = (chartRef: React.RefObject<any>) => {
  if (chartRef.current) {
    chartRef.current.resetZoom()
  }
}

// Color palette for consistent theming
export const CHART_COLORS = {
  primary: '#3B82F6',     // Blue 500
  secondary: '#10B981',   // Emerald 500
  accent: '#F59E0B',      // Amber 500
  danger: '#EF4444',      // Red 500
  purple: '#8B5CF6',      // Violet 500
  cyan: '#06B6D4',        // Cyan 500
  orange: '#F97316',      // Orange 500
  lime: '#84CC16',        // Lime 500
  pink: '#EC4899',        // Pink 500
  indigo: '#6366F1',      // Indigo 500
} as const

// App ID color palette for data submissions
export const APP_ID_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.accent,
  CHART_COLORS.danger,
  CHART_COLORS.purple,
  CHART_COLORS.cyan,
  CHART_COLORS.orange,
  CHART_COLORS.lime,
  CHART_COLORS.pink,
  CHART_COLORS.indigo,
  '#14B8A6', // Teal 500
  '#F59E0B', // Yellow 500
  '#8B5A2B', // Brown 600
  '#6B7280', // Gray 500
  '#7C3AED', // Purple 600
  '#059669', // Emerald 600
  '#DC2626', // Red 600
  '#2563EB', // Blue 600
  '#DB2777', // Pink 600
  '#16A34A'  // Green 600
] as const

// Get consistent color for App ID
export const getAppIdColor = (appId: number): string => {
  return APP_ID_COLORS[appId % APP_ID_COLORS.length]
}

// Export Chart.js for components that need direct access
export { ChartJS }