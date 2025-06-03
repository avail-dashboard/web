import { NextRequest } from 'next/server'
import type { ApiResponse, Block, Extrinsic, Account } from '../types/api'

/**
 * Test utilities for reducing code duplication and improving maintainability
 */

// Request builders
export const createMockRequest = (
  url: string,
  options?: Omit<RequestInit, 'signal'> & { signal?: AbortSignal }
): NextRequest => {
  return new NextRequest(url, options)
}

export const createApiRequest = (
  endpoint: string,
  params?: Record<string, string>
): NextRequest => {
  const url = new URL(`http://localhost:3000${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }
  return new NextRequest(url.toString())
}

// Data factories
export class BlockFactory {
  static create(overrides: Partial<Block> = {}): Block {
    return {
      number: 1000000,
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      parentHash:
        '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      timestamp: Date.now(),
      extrinsics: 5,
      time: new Date().toISOString(),
      stateRoot:
        '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
      extrinsicsRoot:
        '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
      authorId: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      size: 1024,
      weight: 500000,
      spec: 1000,
      finalized: true,
      ...overrides,
    }
  }

  static createMany(count: number, overrides: Partial<Block> = {}): Block[] {
    return Array.from({ length: count }, (_, i) =>
      this.create({
        number: 1000000 - i,
        timestamp: Date.now() - i * 12000, // 12 second intervals
        ...overrides,
      })
    )
  }
}

export class ExtrinsicFactory {
  static create(overrides: Partial<Extrinsic> = {}): Extrinsic {
    return {
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      blockNumber: 1000000,
      extrinsicIndex: 0,
      module: 'System',
      call: 'set_code',
      success: true,
      timestamp: Date.now(),
      signer: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      fee: 1000000000000000,
      tip: 0,
      signature:
        '0x2222222222222222222222222222222222222222222222222222222222222222',
      args: {},
      events: [],
      isSigned: true,
      isUserTransaction: true,
      ...overrides,
    }
  }

  static createDataSubmission(overrides: Partial<Extrinsic> = {}): Extrinsic {
    return this.create({
      module: 'DataAvailability',
      call: 'submit_data',
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
      ...overrides,
    })
  }
}

export class AccountFactory {
  static create(overrides: Partial<Account> = {}): Account {
    return {
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      balance: 1000000000000000000,
      nonce: 5,
      lastUpdated: new Date().toISOString(),
      accountInfo: {
        free: 1000000000000000000,
        reserved: 0,
        frozen: 0,
        flags: 0,
      },
      ...overrides,
    }
  }
}

// Response builders
export const createApiResponse = <T>(
  data: T,
  meta: Partial<ApiResponse<T>['meta']> = {}
): ApiResponse<T> => {
  return {
    success: true,
    data,
    meta: {
      source: 'rpc' as const,
      ...meta,
    },
  }
}

export const createErrorResponse = (
  code: string,
  message: string,
  status = 500
) => {
  return {
    success: false,
    error: { code, message },
    status,
  }
}

// Test assertions
export const expectValidApiResponse = <T>(
  response: unknown
): asserts response is ApiResponse<T> => {
  expect(response).toHaveProperty('success')
  expect(response).toHaveProperty('data')
  expect(response).toHaveProperty('meta')
  expect((response as ApiResponse<T>).meta).toHaveProperty('source')
}

export const expectValidBlock = (block: unknown): asserts block is Block => {
  expect(block).toHaveProperty('number')
  expect(block).toHaveProperty('hash')
  expect(block).toHaveProperty('parentHash')
  expect(block).toHaveProperty('timestamp')
  expect(block).toHaveProperty('finalized')
  expect(typeof (block as Block).number).toBe('number')
  expect(typeof (block as Block).hash).toBe('string')
  expect((block as Block).hash).toMatch(/^0x[a-fA-F0-9]{64}$/)
}

export const expectValidExtrinsic = (
  extrinsic: unknown
): asserts extrinsic is Extrinsic => {
  expect(extrinsic).toHaveProperty('hash')
  expect(extrinsic).toHaveProperty('blockNumber')
  expect(extrinsic).toHaveProperty('module')
  expect(extrinsic).toHaveProperty('call')
  expect(extrinsic).toHaveProperty('success')
  expect(typeof (extrinsic as Extrinsic).blockNumber).toBe('number')
  expect(typeof (extrinsic as Extrinsic).success).toBe('boolean')
}

// Performance testing utilities
export const measureExecutionTime = async <T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> => {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start
  return { result, duration }
}

export const expectPerformance = (duration: number, maxMs: number) => {
  expect(duration).toBeLessThan(maxMs)
}

// Environment utilities
export const withMockEnv = <T>(
  envVars: Record<string, string>,
  fn: () => T
): T => {
  const originalEnv = { ...process.env }

  Object.entries(envVars).forEach(([key, value]) => {
    process.env[key] = value
  })

  try {
    return fn()
  } finally {
    process.env = originalEnv
  }
}

// Async utilities
export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (attempt < maxAttempts) {
        await waitFor(delay)
      }
    }
  }

  throw lastError!
}
