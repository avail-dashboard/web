export const mockExtrinsic = {
  hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  blockNumber: 1000000,
  extrinsicIndex: 0,
  module: 'System',
  call: 'set_code',
  success: true,
  timestamp: 1704067200000,
  signer: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  fee: 1000000000000000,
  tip: 0,
  signature:
    '0x2222222222222222222222222222222222222222222222222222222222222222',
  args: {},
  events: [],
  isSigned: true,
  isUserTransaction: true,
}

export const mockDataSubmissionExtrinsic = {
  hash: '0x3333333333333333333333333333333333333333333333333333333333333333',
  blockNumber: 1000000,
  extrinsicIndex: 1,
  module: 'DataAvailability',
  call: 'submit_data',
  success: true,
  timestamp: 1704067200000,
  signer: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  fee: 2000000000000000,
  tip: 0,
  signature:
    '0x4444444444444444444444444444444444444444444444444444444444444444',
  args: {
    data: '0x48656c6c6f20576f726c64', // "Hello World" in hex
    appId: 1,
  },
  events: [
    {
      id: 'event_1',
      action: 'DataSubmitted',
      type: 'DataAvailability',
    },
  ],
  isSigned: true,
  isUserTransaction: true,
}

export const mockExtrinsicsResponse = {
  success: true,
  data: [
    mockExtrinsic,
    mockDataSubmissionExtrinsic,
    {
      ...mockExtrinsic,
      hash: '0x5555555555555555555555555555555555555555555555555555555555555555',
      extrinsicIndex: 2,
      module: 'Balances',
      call: 'transfer',
      args: {
        dest: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
        value: 1000000000000000000,
      },
    },
  ],
  meta: {
    page: 1,
    limit: 10,
    total: 500000,
    source: 'rpc' as const,
  },
}

export const mockExtrinsicByHashResponse = {
  success: true,
  data: mockDataSubmissionExtrinsic,
  meta: {
    source: 'rpc' as const,
  },
}
