import type { Metadata } from 'next'
import './globals.css'
import { StagewiseToolbar } from '@/components/StagewiseToolbar'
import { Providers } from '@/lib/providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileNavigation } from '@/components/navigation/MobileNavigation'

export const metadata: Metadata = {
  title: 'Avail Explorer',
  description: 'Blockchain explorer for Avail network',
  icons: {
    icon: '/avail-logo.png',
  },
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
            <Header />
            <main className="flex-1 bg-gradient-to-br from-background to-muted/50">
              {children}
            </main>
            <Footer />
          </div>
          <MobileNavigation />
          <StagewiseToolbar />
        </Providers>
      </body>
    </html>
  )
}
