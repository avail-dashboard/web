export const mockSearchResults = {
  block: {
    type: 'block',
    id: '1000000',
    title: 'Block #1000000',
    description: 'Block number 1000000',
    url: '/blocks/1000000',
  },
  extrinsic: {
    type: 'extrinsic',
    id: '0x1234567890abcdef',
    title: 'Extrinsic 0x1234...cdef',
    description: 'Data submission extrinsic',
    url: '/extrinsics/0x1234567890abcdef',
  },
  account: {
    type: 'account',
    id: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    title: 'Account 5Grwv...utQY',
    description: 'Account address',
    url: '/accounts/5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  },
}

export const mockSearchResponse = {
  success: true,
  data: [mockSearchResults.block],
  meta: {
    total: 1,
    source: 'database' as const,
  },
}

export const mockSearchMultipleResponse = {
  success: true,
  data: [
    mockSearchResults.block,
    mockSearchResults.extrinsic,
    mockSearchResults.account,
  ],
  meta: {
    total: 3,
    source: 'database' as const,
  },
}
