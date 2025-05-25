'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ExtrinsicDetails } from '@/components/blocks/ExtrinsicDetails'
import { Extrinsic } from '@/lib/api'

interface ExtrinsicPageProps {
  params: {
    hash: string
  }
}

export default function ExtrinsicPage({ params }: ExtrinsicPageProps) {
  const router = useRouter()
  const [extrinsic, setExtrinsic] = useState<Extrinsic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const extrinsicHash = params.hash

  useEffect(() => {
    // Mock extrinsic data - in reality this would come from an API call
    const fetchExtrinsic = async () => {
      try {
        setLoading(true)

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock extrinsic data
        const mockExtrinsic: Extrinsic = {
          hash: extrinsicHash,
          blockNumber: 999999,
          module: 'balances',
          call: 'transfer',
          success: true,
          timestamp: Date.now() - 300000, // 5 minutes ago
          signer: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          fee: 1000000000000000, // 0.001 AVAIL
          extrinsicIndex: 2,
        }

        setExtrinsic(mockExtrinsic)
      } catch (err) {
        setError('Failed to load extrinsic details')
      } finally {
        setLoading(false)
      }
    }

    fetchExtrinsic()
  }, [extrinsicHash])

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
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

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <p className="mt-4 text-muted-foreground">
              Loading extrinsic details...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !extrinsic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
        <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-avail-600">
                Avail Explorer
              </h1>
            </div>
          </div>
        </header>

        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold mb-2">Extrinsic Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The extrinsic with hash {extrinsicHash} could not be found.
          </p>
          <button
            onClick={handleBack}
            className="bg-avail-600 text-white px-4 py-2 rounded hover:bg-avail-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

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

      <main>
        <ExtrinsicDetails extrinsic={extrinsic} onBack={handleBack} />
      </main>
    </div>
  )
}
