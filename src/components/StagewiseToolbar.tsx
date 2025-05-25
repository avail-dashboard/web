'use client'

import { StagewiseToolbar as Toolbar } from '@stagewise/toolbar-next'

const stagewiseConfig = {
  plugins: [],
}

export function StagewiseToolbar() {
  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return <Toolbar config={stagewiseConfig} />
}
