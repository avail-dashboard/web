'use client'

import { AccountDetails } from '@/components/accounts/AccountDetails'

interface AccountPageProps {
  params: {
    address: string
  }
}

export default function AccountPage({ params }: AccountPageProps) {
  const address = params.address

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <AccountDetails address={address} />
    </div>
  )
}
