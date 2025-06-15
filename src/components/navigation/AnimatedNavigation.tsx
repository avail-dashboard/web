'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useNavigation } from '@/contexts/NavigationContext'
import { Home, Blocks, Activity, User, Layers, Shield } from 'lucide-react'
import Link from 'next/link'

const iconMap = {
  home: Home,
  blocks: Blocks,
  extrinsics: Activity,
  accounts: User,
  'data-submissions': Activity,
  rollups: Layers,
  validators: Shield,
}

const colorMap = {
  avail: 'text-avail-600 hover:text-avail-700',
  blue: 'text-blue-600 hover:text-blue-700',
  green: 'text-green-600 hover:text-green-700',
  purple: 'text-purple-600 hover:text-purple-700',
  orange: 'text-orange-600 hover:text-orange-700',
  red: 'text-red-600 hover:text-red-700',
}

export function AnimatedNavigation() {
  const pathname = usePathname()
  const { navigationItems } = useNavigation()

  // Determine active section from pathname
  const currentSection = navigationItems.find(item => {
    if (item.href === '/' && pathname === '/') return true
    if (item.href !== '/' && pathname.startsWith(item.href)) return true
    return false
  })?.id || null

  return (
    <AnimatePresence>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex items-center space-x-1 md:space-x-2"
      >
        {navigationItems.map(item => {
          const IconComponent = iconMap[item.id as keyof typeof iconMap]
          const isActive = currentSection === item.id
          const colorClass = colorMap[item.color as keyof typeof colorMap] || colorMap.avail

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.3, 
                ease: 'easeOut',
                delay: navigationItems.indexOf(item) * 0.05
              }}
            >
              <Link
                href={item.href}
                className={`
                  flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isActive 
                    ? `bg-${item.color}-50 ${colorClass} border border-${item.color}-200` 
                    : `text-muted-foreground hover:text-foreground hover:bg-muted/50`
                  }
                `}
              >
                {IconComponent && (
                  <IconComponent className="h-4 w-4" />
                )}
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            </motion.div>
          )
        })}
      </motion.nav>
    </AnimatePresence>
  )
}

export function AnimatedSearchBar() {
  const [query, setQuery] = React.useState('')
  const router = useRouter()

  const detectSearchType = (
    input: string
  ): 'block' | 'transaction' | 'account' | 'unknown' => {
    const trimmed = input.trim()

    // Block number (numeric)
    if (/^\d+$/.test(trimmed)) {
      return 'block'
    }

    // Transaction hash or block hash (0x followed by hex)
    if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
      return 'transaction'
    }

    // Account address (starts with 5 and is 48 characters)
    if (/^5[a-zA-Z0-9]{47}$/.test(trimmed)) {
      return 'account'
    }

    return 'unknown'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    const searchType = detectSearchType(query)

    // Navigate based on search type
    switch (searchType) {
      case 'block':
        router.push(`/blocks/${query.trim()}`)
        break
      case 'transaction':
        router.push(`/extrinsics/${query.trim()}`)
        break
      case 'account':
        router.push(`/accounts/${query.trim()}`)
        break
      default:
        // For unknown types, try searching as block number first
        router.push(`/blocks/${query.trim()}`)
        break
    }

    setQuery('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex-1 max-w-md"
    >
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search blocks, transactions, or accounts..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-avail-500 focus:border-transparent text-sm"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </form>
    </motion.div>
  )
}