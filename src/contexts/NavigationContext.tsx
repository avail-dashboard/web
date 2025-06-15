'use client'

import React, { createContext, useContext, useState } from 'react'

export interface NavigationItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  color: string
}

interface NavigationContextType {
  isAnimating: boolean
  setIsAnimating: (animating: boolean) => void
  activeSection: string | null
  setActiveSection: (section: string | null) => void
  animationTarget: string | null
  setAnimationTarget: (target: string | null) => void
  navigationItems: NavigationItem[]
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [animationTarget, setAnimationTarget] = useState<string | null>(null)

  // Define the navigation items that match the homepage cards
  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: null, // Will be added later
      color: 'avail'
    },
    {
      id: 'blocks',
      label: 'Blocks',
      href: '/blocks',
      icon: null, // Will use Blocks icon
      color: 'avail'
    },
    {
      id: 'extrinsics',
      label: 'Transactions',
      href: '/extrinsics',
      icon: null, // Will use Activity icon
      color: 'blue'
    },
    {
      id: 'accounts',
      label: 'Accounts',
      href: '/accounts',
      icon: null, // Will use User icon
      color: 'green'
    },
    {
      id: 'data-submissions',
      label: 'Data Submissions',
      href: '/data-submissions',
      icon: null, // Will use Activity icon
      color: 'purple'
    },
    {
      id: 'rollups',
      label: 'Rollups',
      href: '/rollups',
      icon: null, // Will add later
      color: 'orange'
    },
    {
      id: 'validators',
      label: 'Validators',
      href: '/validators',
      icon: null, // Will add later
      color: 'red'
    }
  ]

  return (
    <NavigationContext.Provider
      value={{
        isAnimating,
        setIsAnimating,
        activeSection,
        setActiveSection,
        animationTarget,
        setAnimationTarget,
        navigationItems,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}