export const mockBlock = {
  number: 1000000,
  hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  parentHash:
    '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  timestamp: 1704067200000,
  extrinsics: 5,
  time: '2024-01-01T00:00:00.000Z',
  stateRoot:
    '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
  extrinsicsRoot:
    '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
  authorId: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  size: 1024,
  weight: 500000,
  spec: 1000,
  finalized: true,
}

export const mockBlockWithExtrinsics = {
  ...mockBlock,
  extrinsicsCount: 5,
  extrinsics: [
    {
      id: 'ext_123',
      hash: '0x1111111111111111111111111111111111111111111111111111111111111111',
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
    },
    {
      id: 'ext_124',
      hash: '0x3333333333333333333333333333333333333333333333333333333333333333',
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
      events: [],
    },
  ],
}

export const mockBlocksResponse = {
  success: true,
  data: [
    mockBlock,
    {
      ...mockBlock,
      number: 999999,
      hash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      timestamp: 1704067180000,
      time: '2024-01-01T00:00:20.000Z',
    },
    {
      ...mockBlock,
      number: 999998,
      hash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      timestamp: 1704067160000,
      time: '2024-01-01T00:00:40.000Z',
    },
  ],
  meta: {
    page: 1,
    limit: 10,
    total: 1000000,
    source: 'rpc' as const,
  },
}

export const mockBlockByIdResponse = {
  success: true,
  data: mockBlockWithExtrinsics,
  meta: {
    source: 'rpc' as const,
  },
}
