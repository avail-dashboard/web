import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import { StagewiseToolbar } from '@/components/StagewiseToolbar'
import { Providers } from '@/lib/providers'

export const metadata: Metadata = {
  title: 'Avail Explorer',
  description: 'Blockchain explorer for Avail network',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
          <StagewiseToolbar />
        </Providers>
      </body>
    </html>
  )
}
