'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useNavigation } from '@/contexts/NavigationContext'
import { Blocks, Activity, User, Layers, Shield, Menu, X } from 'lucide-react'

const iconMap = {
  blocks: Blocks,
  extrinsics: Activity,
  accounts: User,
  'data-submissions': Activity,
  rollups: Layers,
  validators: Shield,
}

const colorMap = {
  avail: 'text-avail-600 hover:text-avail-700 bg-avail-50 border-avail-200',
  blue: 'text-blue-600 hover:text-blue-700 bg-blue-50 border-blue-200',
  green: 'text-green-600 hover:text-green-700 bg-green-50 border-green-200',
  purple: 'text-purple-600 hover:text-purple-700 bg-purple-50 border-purple-200',
  orange: 'text-orange-600 hover:text-orange-700 bg-orange-50 border-orange-200',
  red: 'text-red-600 hover:text-red-700 bg-red-50 border-red-200',
}

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { navigationItems } = useNavigation()

  // Determine active section from pathname
  const currentSection = navigationItems.find(item => {
    if (item.href === '/' && pathname === '/') return true
    if (item.href !== '/' && pathname.startsWith(item.href)) return true
    return false
  })?.id || null

  const handleItemClick = (href: string) => {
    setIsOpen(false)
    router.push(href)
  }

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg border bg-background hover:bg-muted transition-colors"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Navigation Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-80 bg-white border-l border-gray-200 shadow-2xl z-50 lg:hidden"
              style={{ 
                backgroundColor: 'white',
                background: 'white'
              }}
            >
              <div className="flex flex-col h-full bg-white">
                {/* Header with close button only */}
                <div className="flex items-center justify-end p-4 bg-white">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Close navigation menu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 px-4 pb-4 space-y-2 bg-white">
                  {navigationItems.filter(item => item.id !== 'home').map(item => {
                    const IconComponent = iconMap[item.id as keyof typeof iconMap]
                    const isActive = currentSection === item.id
                    const colorClass = colorMap[item.color as keyof typeof colorMap] || colorMap.avail

                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => handleItemClick(item.href)}
                        className={`
                          w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left
                          transition-all duration-200 border
                          ${isActive 
                            ? `${colorClass} border` 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-transparent'
                          }
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {IconComponent && (
                          <IconComponent className="h-5 w-5 flex-shrink-0" />
                        )}
                        <span className="font-medium">{item.label}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}