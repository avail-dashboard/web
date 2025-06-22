'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useNavigation } from '@/contexts/NavigationContext'

interface MobileMenuButtonProps {
  className?: string
}

export function MobileMenuButton({ className = '' }: MobileMenuButtonProps) {
  const { isMobileMenuOpen, toggleMobileMenu } = useNavigation()

  return (
    <motion.button
      onClick={toggleMobileMenu}
      className={`
        relative p-2 rounded-lg transition-colors duration-200
        hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-avail-500
        pointer-events-auto z-[110]
        ${className}
      `}
      whileTap={{ scale: 0.95 }}
      aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isMobileMenuOpen}
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        {/* Top line */}
        <motion.span
          className="block h-0.5 w-6 bg-current rounded-full"
          animate={{
            rotate: isMobileMenuOpen ? 45 : 0,
            y: isMobileMenuOpen ? 8 : 0,
          }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
        />

        {/* Middle line */}
        <motion.span
          className="block h-0.5 w-6 bg-current rounded-full mt-1.5"
          animate={{
            opacity: isMobileMenuOpen ? 0 : 1,
            x: isMobileMenuOpen ? 20 : 0,
          }}
          transition={{
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1],
          }}
        />

        {/* Bottom line */}
        <motion.span
          className="block h-0.5 w-6 bg-current rounded-full mt-1.5"
          animate={{
            rotate: isMobileMenuOpen ? -45 : 0,
            y: isMobileMenuOpen ? -8 : 0,
          }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      </div>
    </motion.button>
  )
}
