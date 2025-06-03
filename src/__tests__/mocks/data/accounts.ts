export const mockAccount = {
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  balance: 1000000000000000000,
  nonce: 5,
  lastUpdated: '2024-01-01T00:00:00.000Z',
  accountInfo: {
    free: 1000000000000000000,
    reserved: 0,
    frozen: 0,
    flags: 0,
  },
}

export const mockAccountResponse = {
  success: true,
  data: mockAccount,
  meta: {
    source: 'rpc' as const,
  },
}
