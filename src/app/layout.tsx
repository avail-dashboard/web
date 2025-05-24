import type { Metadata } from 'next'
import './globals.css'
import { StagewiseToolbar } from '@/components/StagewiseToolbar'

export const metadata: Metadata = {
  title: 'Avail Explorer - Blockchain Dashboard',
  description: 'A comprehensive blockchain explorer dashboard for the Avail network',
  keywords: ['blockchain', 'avail', 'explorer', 'dashboard', 'data availability'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
        </div>
        <StagewiseToolbar />
      </body>
    </html>
  )
} 