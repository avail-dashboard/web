// Chart theme configuration for light and dark modes
import type { ChartOptions } from 'chart.js'

export interface ChartThemeColors {
  primary: string
  secondary: string
  accent: string
  danger: string
  purple: string
  cyan: string
  orange: string
  lime: string
  pink: string
  indigo: string
  background: string
  foreground: string
  muted: string
  border: string
  grid: string
}

// Light theme colors
export const lightThemeColors: ChartThemeColors = {
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
  background: '#FFFFFF',
  foreground: '#0F172A',
  muted: '#F1F5F9',
  border: '#E2E8F0',
  grid: '#F1F5F9',
}

// Dark theme colors
export const darkThemeColors: ChartThemeColors = {
  primary: '#60A5FA',     // Blue 400
  secondary: '#34D399',   // Emerald 400
  accent: '#FBBF24',      // Amber 400
  danger: '#F87171',      // Red 400
  purple: '#A78BFA',      // Violet 400
  cyan: '#22D3EE',        // Cyan 400
  orange: '#FB923C',      // Orange 400
  lime: '#A3E635',        // Lime 400
  pink: '#F472B6',        // Pink 400
  indigo: '#818CF8',      // Indigo 400
  background: '#0F172A',
  foreground: '#F8FAFC',
  muted: '#1E293B',
  border: '#334155',
  grid: '#1E293B',
}

// Get theme colors based on current theme
export function getThemeColors(theme: 'light' | 'dark'): ChartThemeColors {
  return theme === 'dark' ? darkThemeColors : lightThemeColors
}

// Get CSS variable values from DOM (fallback method)
export function getCSSVariableColors(): ChartThemeColors {
  if (typeof window === 'undefined') {
    return lightThemeColors
  }

  const root = document.documentElement
  const getColor = (variable: string) => {
    const value = getComputedStyle(root).getPropertyValue(variable).trim()
    if (value.includes(' ')) {
      // Convert HSL values to hex
      const [h, s, l] = value.split(' ').map(v => parseFloat(v.replace('%', '')))
      return hslToHex(h, s, l)
    }
    return value || '#000000'
  }

  return {
    primary: getColor('--chart-1') || '#3B82F6',
    secondary: getColor('--chart-2') || '#10B981',
    accent: getColor('--chart-3') || '#F59E0B',
    danger: getColor('--chart-4') || '#EF4444',
    purple: getColor('--chart-5') || '#8B5CF6',
    cyan: '#06B6D4',
    orange: '#F97316',
    lime: '#84CC16',
    pink: '#EC4899',
    indigo: '#6366F1',
    background: getColor('--background') || '#FFFFFF',
    foreground: getColor('--foreground') || '#000000',
    muted: getColor('--muted') || '#F1F5F9',
    border: getColor('--border') || '#E2E8F0',
    grid: getColor('--muted') || '#F1F5F9',
  }
}

// Convert HSL to Hex
function hslToHex(h: number, s: number, l: number): string {
  l /= 100
  const a = s * Math.min(l, 1 - l) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

// Chart color palette for different chart types
export function getChartColorPalette(theme: 'light' | 'dark', count: number = 10): string[] {
  const colors = getThemeColors(theme)
  const palette = [
    colors.primary,
    colors.secondary,
    colors.accent,
    colors.danger,
    colors.purple,
    colors.cyan,
    colors.orange,
    colors.lime,
    colors.pink,
    colors.indigo,
  ]
  
  // Extend palette if more colors needed
  while (palette.length < count) {
    palette.push(...palette)
  }
  
  return palette.slice(0, count)
}

// Get theme-aware chart options
export function getThemedChartOptions(
  theme: 'light' | 'dark',
  baseOptions: Partial<ChartOptions> = {}
): ChartOptions {
  const colors = getThemeColors(theme)
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    ...baseOptions,
    plugins: {
      legend: {
        labels: {
          color: colors.foreground,
          font: {
            size: 11,
          },
          padding: 20,
          usePointStyle: true,
        },
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: colors.foreground,
        bodyColor: colors.foreground,
        borderColor: colors.border,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
      },
      ...baseOptions.plugins,
    },
    scales: {
      x: {
        ticks: {
          color: colors.foreground,
        },
        grid: {
          color: colors.grid,
        },
        border: {
          color: colors.border,
        },
      },
      y: {
        ticks: {
          color: colors.foreground,
        },
        grid: {
          color: colors.grid,
        },
        border: {
          color: colors.border,
        },
      },
      y1: {
        ticks: {
          color: colors.foreground,
        },
        grid: {
          color: colors.grid,
        },
        border: {
          color: colors.border,
        },
      },
      ...baseOptions.scales,
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart' as const,
    },
  }
}

// App ID colors with theme awareness
export function getAppIdColor(appId: number, theme: 'light' | 'dark'): string {
  const palette = getChartColorPalette(theme, 20)
  return palette[appId % palette.length]
} 