import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { Header } from '../Header'
import { useChainData, useBackendStatus } from '@/lib/hooks/useAvailAPI'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

// Mock the hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/lib/hooks/useAvailAPI', () => ({
  useChainData: jest.fn(),
  useBackendStatus: jest.fn(),
}))

// Mock the components
jest.mock('@/components/BackendStatus', () => ({
  StatusBadge: () => <div data-testid="status-badge">Status Badge</div>,
}))

jest.mock('@/components/ui/RefreshIndicator', () => ({
  RefreshIndicator: ({ isRefreshing }: { isRefreshing: boolean }) => (
    <div data-testid="refresh-indicator">
      {isRefreshing ? 'Refreshing...' : 'Not refreshing'}
    </div>
  ),
}))

jest.mock('@/components/ui/ErrorDisplay', () => ({
  ErrorDisplay: ({
    error,
    onRetry,
    compact,
  }: {
    error: Error
    onRetry: () => void
    compact: boolean
  }) => (
    <div data-testid="error-display">
      <span>Error: {error?.message || 'Unknown error'}</span>
      <button onClick={onRetry} data-testid="error-retry">
        Retry
      </button>
      <span>Compact: {compact ? 'true' : 'false'}</span>
    </div>
  ),
}))

const mockRouter: AppRouterInstance = {
  push: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
}

const mockUseChainData = useChainData as jest.MockedFunction<
  typeof useChainData
>
const mockUseBackendStatus = useBackendStatus as jest.MockedFunction<
  typeof useBackendStatus
>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

const mockBackendStatus = {
  isConnected: true,
  isChecking: false,
  lastChecked: new Date(),
  checkStatus: jest.fn(),
}

const mockChainDataBase = {
  finalizedBlocks: 1000000,
  signedExtrinsics: 500000,
  stakedAmount: '1000000',
  bondedAmount: '2000000',
  holders: 10000,
  totalAccounts: 15000,
  transfers: 250000,
  inflationRate: 5.5,
  tokenPrice: 0.12345678,
  priceChange: 5.67,
  totalIssuance: '2000000000',
  circulating: {
    amount: '800000000',
    percentage: 40,
  },
  staking: {
    amount: '600000000',
    percentage: 30,
  },
  treasury: {
    amount: '100000000',
    percentage: 5,
  },
  others: {
    amount: '500000000',
    percentage: 25,
  },
  marketCap: 246913560,
  totalSupply: 2000000000,
  circulatingSupply: 800000000,
  stakingRatio: 30,
  inflation: 5.5,
  activeValidators: 100,
  blockTime: 12,
  lastBlockTimestamp: Date.now(),
}

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue(mockRouter)
  })

  it('renders the basic header structure', () => {
    mockUseChainData.mockReturnValue({
      data: null,
      loading: false,
      refreshing: false,
      error: null,
      refetch: jest.fn(),
    })
    mockUseBackendStatus.mockReturnValue(mockBackendStatus)

    render(<Header />)

    expect(screen.getByAltText('Avail')).toBeInTheDocument()
    expect(screen.getByText('Explorer')).toBeInTheDocument()
    expect(screen.getByText('Mainnet')).toBeInTheDocument()
    expect(screen.getByTestId('status-badge')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
  })

  it('displays chain data when available', () => {
    const mockChainData = {
      ...mockChainDataBase,
      tokenPrice: 0.12345678,
      priceChange: 5.67,
    }

    mockUseChainData.mockReturnValue({
      data: mockChainData,
      loading: false,
      refreshing: false,
      error: null,
      refetch: jest.fn(),
    })
    mockUseBackendStatus.mockReturnValue(mockBackendStatus)

    render(<Header />)

    expect(screen.getByText('AVAIL $0.12345678')).toBeInTheDocument()
    expect(screen.getByText('+5.67%')).toBeInTheDocument()
  })

  it('displays negative price change correctly', () => {
    const mockChainData = {
      ...mockChainDataBase,
      tokenPrice: 0.12345678,
      priceChange: -2.34,
    }

    mockUseChainData.mockReturnValue({
      data: mockChainData,
      loading: false,
      refreshing: false,
      error: null,
      refetch: jest.fn(),
    })
    mockUseBackendStatus.mockReturnValue(mockBackendStatus)

    render(<Header />)

    expect(screen.getByText('-2.34%')).toBeInTheDocument()
    expect(screen.getByText('-2.34%')).toHaveClass('text-red-500')
  })

  it('shows backend offline message when not connected', () => {
    mockUseChainData.mockReturnValue({
      data: null,
      loading: false,
      refreshing: false,
      error: null,
      refetch: jest.fn(),
    })
    mockUseBackendStatus.mockReturnValue({
      ...mockBackendStatus,
      isConnected: false,
    })

    render(<Header />)

    expect(
      screen.getByText('Backend offline - using fallback')
    ).toBeInTheDocument()
  })

  it('displays error when chain data fails to load', () => {
    const mockError = new Error('Failed to fetch chain data')
    const mockRefetch = jest.fn()

    mockUseChainData.mockReturnValue({
      data: null,
      loading: false,
      refreshing: false,
      error: mockError,
      refetch: mockRefetch,
    })
    mockUseBackendStatus.mockReturnValue(mockBackendStatus)

    render(<Header />)

    expect(screen.getByTestId('error-display')).toBeInTheDocument()
    expect(
      screen.getByText('Error: Failed to fetch chain data')
    ).toBeInTheDocument()
  })

  it('shows loading state correctly', () => {
    mockUseChainData.mockReturnValue({
      data: null,
      loading: true,
      refreshing: false,
      error: null,
      refetch: jest.fn(),
    })
    mockUseBackendStatus.mockReturnValue(mockBackendStatus)

    render(<Header />)

    const refreshButton = screen.getByRole('button', { name: /loading/i })
    expect(refreshButton).toBeDisabled()
    expect(refreshButton).toHaveTextContent('Loading...')
  })

  it('shows refreshing state correctly', () => {
    mockUseChainData.mockReturnValue({
      data: null,
      loading: false,
      refreshing: true,
      error: null,
      refetch: jest.fn(),
    })
    mockUseBackendStatus.mockReturnValue(mockBackendStatus)

    render(<Header />)

    expect(screen.getByTestId('refresh-indicator')).toHaveTextContent(
      'Refreshing...'
    )
  })

  it('calls refetch and router.refresh when refresh button is clicked', async () => {
    const mockRefetch = jest.fn()

    mockUseChainData.mockReturnValue({
      data: null,
      loading: false,
      refreshing: false,
      error: null,
      refetch: mockRefetch,
    })
    mockUseBackendStatus.mockReturnValue(mockBackendStatus)

    render(<Header />)

    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)

    expect(mockRefetch).toHaveBeenCalledTimes(1)
    expect(mockRouter.refresh).toHaveBeenCalledTimes(1)
  })

  it('calls refetch when error retry button is clicked', async () => {
    const mockError = new Error('Network error')
    const mockRefetch = jest.fn()

    mockUseChainData.mockReturnValue({
      data: null,
      loading: false,
      refreshing: false,
      error: mockError,
      refetch: mockRefetch,
    })
    mockUseBackendStatus.mockReturnValue(mockBackendStatus)

    render(<Header />)

    const retryButton = screen.getByTestId('error-retry')
    fireEvent.click(retryButton)

    expect(mockRefetch).toHaveBeenCalledTimes(1)
    expect(mockRouter.refresh).toHaveBeenCalledTimes(1)
  })

  it('navigates to home when logo is clicked', () => {
    mockUseChainData.mockReturnValue({
      data: null,
      loading: false,
      refreshing: false,
      error: null,
      refetch: jest.fn(),
    })
    mockUseBackendStatus.mockReturnValue(mockBackendStatus)

    render(<Header />)

    const logoLink = screen.getByRole('link', { name: /avail/i })
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('handles missing chain data gracefully', () => {
    mockUseChainData.mockReturnValue({
      data: {
        ...mockChainDataBase,
        tokenPrice: 0 as number,
        priceChange: 0 as number,
      },
      loading: false,
      refreshing: false,
      error: null,
      refetch: jest.fn(),
    })
    mockUseBackendStatus.mockReturnValue(mockBackendStatus)

    render(<Header />)

    expect(screen.getByText('AVAIL $0.00000000')).toBeInTheDocument()
    expect(screen.getByText('0.00%')).toBeInTheDocument()
  })

  it('applies correct CSS classes for sticky header', () => {
    mockUseChainData.mockReturnValue({
      data: null,
      loading: false,
      refreshing: false,
      error: null,
      refetch: jest.fn(),
    })
    mockUseBackendStatus.mockReturnValue(mockBackendStatus)

    const { container } = render(<Header />)
    const header = container.querySelector('header')

    expect(header).toHaveClass('sticky', 'top-0', 'z-50')
  })

  it('shows mainnet indicator with animation', () => {
    mockUseChainData.mockReturnValue({
      data: null,
      loading: false,
      refreshing: false,
      error: null,
      refetch: jest.fn(),
    })
    mockUseBackendStatus.mockReturnValue(mockBackendStatus)

    const { container } = render(<Header />)
    const indicator = container.querySelector('.animate-pulse')

    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveClass('bg-green-500', 'rounded-full')
  })
})
