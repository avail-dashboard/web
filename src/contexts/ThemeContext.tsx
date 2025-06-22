'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'
type ActualTheme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  actualTheme: ActualTheme
  systemTheme: ActualTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Custom hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // During SSR, return default values instead of throwing
    if (typeof window === 'undefined') {
      return {
        theme: 'system' as Theme,
        actualTheme: 'light' as ActualTheme,
        systemTheme: 'light' as ActualTheme,
        setTheme: () => {},
      }
    }
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'avail-explorer-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [systemTheme, setSystemTheme] = useState<ActualTheme>('light')
  const [mounted, setMounted] = useState(false)

  // Get actual theme based on current theme setting
  const actualTheme: ActualTheme = theme === 'system' ? systemTheme : theme

  // System theme detection
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
    }

    // Set initial system theme
    updateSystemTheme()

    // Listen for system theme changes
    mediaQuery.addEventListener('change', updateSystemTheme)
    
    return () => mediaQuery.removeEventListener('change', updateSystemTheme)
  }, [])

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        setThemeState(storedTheme)
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error)
    }
    
    setMounted(true)
  }, [storageKey])

  // Apply theme to DOM
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    
    // Add new theme class
    root.classList.add(actualTheme)
    
    // Update CSS custom property for theme-aware components
    root.style.setProperty('--theme', actualTheme)
  }, [actualTheme, mounted])

  // Save theme to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    
    try {
      localStorage.setItem(storageKey, newTheme)
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
    }
  }

  // Provide default values during SSR and before mounting to prevent hydration mismatch
  const value: ThemeContextType = {
    theme: mounted ? theme : defaultTheme,
    actualTheme: mounted ? actualTheme : 'light',
    systemTheme: mounted ? systemTheme : 'light',
    setTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
} 