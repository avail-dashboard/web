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
    <div className="app-container py-6">
      <AccountDetails address={address} />
    </div>
  )
}
