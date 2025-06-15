'use client'

import { useRouter } from 'next/navigation'
import { BlockDetails } from '@/components/blocks/BlockDetails'

interface BlockPageProps {
  params: {
    id: string
  }
}

export default function BlockPage({ params }: BlockPageProps) {
  const router = useRouter()
  const blockId = params.id

  const handleNavigate = (blockNumber: number) => {
    router.push(`/blocks/${blockNumber}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BlockDetails blockNumber={blockId} onNavigate={handleNavigate} />
    </div>
  )
}
