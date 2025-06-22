'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useNavigation } from '@/contexts/NavigationContext'
import { Blocks, Activity, User, Layers, Shield } from 'lucide-react'

const iconMap = {
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

export function MobileNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { navigationItems, isMobileMenuOpen, setIsMobileMenuOpen } =
    useNavigation()

  // Determine active section from pathname
  const currentSection =
    navigationItems.find(item => {
      if (item.href === '/' && pathname === '/') return true
      if (item.href !== '/' && pathname.startsWith(item.href)) return true
      return false
    })?.id || null

  // Close menu when route changes
  const pathnameRef = React.useRef(pathname)

  useEffect(() => {
    if (pathnameRef.current !== pathname && isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
    pathnameRef.current = pathname
  }, [pathname, isMobileMenuOpen, setIsMobileMenuOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen, setIsMobileMenuOpen])

  const handleNavClick = (href: string, disabled?: boolean) => {
    if (disabled) return

    setIsMobileMenuOpen(false)
    router.push(href)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the backdrop, not on child elements
    if (e.target === e.currentTarget) {
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-16 bottom-0 left-0 right-0 z-[100] lg:hidden"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />

          {/* Navigation Panel - positioned at top of container */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="absolute top-0 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="app-container py-6">
              <nav className="space-y-2">
                {navigationItems.map((item, index) => {
                  const IconComponent = iconMap[item.id as keyof typeof iconMap]
                  const isActive = currentSection === item.id
                  const colorClass =
                    colorMap[item.color as keyof typeof colorMap] ||
                    colorMap.avail
                  const isDisabled = item.disabled

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1],
                        delay: index * 0.05,
                      }}
                    >
                      {isDisabled ? (
                        <div
                          className={`
                            flex items-center space-x-4 px-4 py-4 rounded-lg text-base font-medium
                            transition-all duration-200 cursor-not-allowed opacity-50
                            text-muted-foreground
                          `}
                        >
                          {IconComponent && (
                            <IconComponent className="h-5 w-5 flex-shrink-0" />
                          )}
                          <span>{item.label}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleNavClick(item.href)}
                          className={`
                            w-full flex items-center space-x-4 px-4 py-4 rounded-lg text-base font-medium
                            transition-all duration-200 text-left
                            ${
                              isActive
                                ? `bg-${item.color}-50 ${colorClass} border border-${item.color}-200`
                                : `text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted/70`
                            }
                          `}
                        >
                          {IconComponent && (
                            <IconComponent className="h-5 w-5 flex-shrink-0" />
                          )}
                          <span>{item.label}</span>
                        </button>
                      )}
                    </motion.div>
                  )
                })}
              </nav>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
