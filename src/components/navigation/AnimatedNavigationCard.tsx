'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useNavigation } from '@/contexts/NavigationContext'
import { ArrowRight } from 'lucide-react'

interface AnimatedNavigationCardProps {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href: string
  stats?: Array<{ label: string; value: string }>
  colorClass?: string
  children?: React.ReactNode
}

export function AnimatedNavigationCard({
  id,
  title,
  description,
  icon,
  href,
  stats,
  colorClass = 'avail',
  children
}: AnimatedNavigationCardProps) {
  const router = useRouter()
  const { setIsAnimating, setAnimationTarget } = useNavigation()

  const handleClick = async () => {
    setIsAnimating(true)
    setAnimationTarget(id)

    // Add a small delay to let the animation state update
    await new Promise(resolve => setTimeout(resolve, 50))

    // Navigate to the target page
    router.push(href)

    // Reset animation state after navigation
    setTimeout(() => {
      setIsAnimating(false)
      setAnimationTarget(null)
    }, 400)
  }

  return (
    <motion.div
      layoutId={`nav-card-${id}`}
      className="group cursor-pointer"
      onClick={handleClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <motion.div
        className={`
          bg-card p-6 rounded-lg border shadow-sm hover:shadow-md 
          transition-all duration-200 group-hover:border-${colorClass}-600/50
        `}
        layout
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <motion.div
              layoutId={`nav-icon-${id}`}
              className={`
                p-2 bg-${colorClass === 'avail' ? 'avail' : colorClass}-100 rounded-lg 
                group-hover:bg-${colorClass === 'avail' ? 'avail' : colorClass}-200 transition-colors
              `}
            >
              {icon}
            </motion.div>
            <div>
              <motion.h3 
                layoutId={`nav-title-${id}`}
                className="font-semibold text-lg"
              >
                {title}
              </motion.h3>
              <motion.p 
                className="text-sm text-muted-foreground"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {description}
              </motion.p>
            </div>
          </div>
          <ArrowRight 
            className={`
              h-5 w-5 text-muted-foreground 
              group-hover:text-${colorClass === 'avail' ? 'avail' : colorClass}-600 
              transition-colors
            `} 
          />
        </div>

        {/* Stats section */}
        {stats && (
          <motion.div 
            className="space-y-2 text-sm"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-muted-foreground">{stat.label}:</span>
                <span className="font-mono">{stat.value}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Custom children content */}
        {children && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}