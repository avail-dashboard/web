'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { extrinsicsApi } from '@/lib/api'
import { ExtrinsicDetails } from '@/components/blocks/ExtrinsicDetails'

interface ExtrinsicPageProps {
  params: {
    hash: string
  }
}

export default function ExtrinsicPage({ params }: ExtrinsicPageProps) {
  const router = useRouter()
  const extrinsicHash = params.hash

  const {
    data: extrinsic,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['extrinsic', extrinsicHash],
    queryFn: () => extrinsicsApi.getExtrinsic(extrinsicHash),
    enabled: !!extrinsicHash,
  })

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="app-container py-6">
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
      <div className="app-container py-6">
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
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <ExtrinsicDetails extrinsic={extrinsic} onBack={handleBack} />
    </div>
  )
}
