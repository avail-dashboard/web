'use client'

import { BlockList } from '@/components/blocks/BlockList'

export default function BlocksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-avail-600">
              Avail Explorer
            </h1>
            <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Mainnet</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <BlockList />
      </main>
    </div>
  )
}
