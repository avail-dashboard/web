'use client'

import { AccountDetails } from '@/components/accounts/AccountDetails'

interface AccountPageProps {
  params: {
    address: string
  }
}

export default function AccountPage({ params }: AccountPageProps) {
  const address = params.address

  return <AccountDetails address={address} />
}
