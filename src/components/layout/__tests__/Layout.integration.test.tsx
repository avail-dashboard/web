import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { Header } from '../Header'
import { Footer } from '../Footer'
import { useChainData, useBackendStatus } from '@/lib/hooks/useAvailAPI'

// Mock the hooks and dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/lib/hooks/useAvailAPI', () => ({
  useChainData: jest.fn(),
  useBackendStatus: jest.fn(),
}))

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
  ErrorDisplay: ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div data-testid="error-display">
      <span>Error: {error?.message || 'Unknown error'}</span>
      <button onClick={onRetry} data-testid="error-retry">
        Retry
      </button>
    </div>
  ),
}))

const mockRouter = {
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

// Complete layout component for testing
const TestLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="relative flex min-h-screen flex-col">
    <Header />
    <main className="flex-1 bg-gradient-to-br from-background to-muted/50">
      {children}
    </main>
    <Footer />
  </div>
)

describe('Layout Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue(mockRouter)
    mockUseChainData.mockReturnValue({
      data: {
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
        circulating: { amount: '800000000', percentage: 40 },
        staking: { amount: '600000000', percentage: 30 },
        treasury: { amount: '100000000', percentage: 5 },
        others: { amount: '500000000', percentage: 25 },
        marketCap: 246913560,
        totalSupply: 2000000000,
        circulatingSupply: 800000000,
        stakingRatio: 30,
        inflation: 5.5,
        activeValidators: 100,
        blockTime: 12,
        lastBlockTimestamp: Date.now(),
      },
      loading: false,
      refreshing: false,
      error: null,
      refetch: jest.fn(),
    })
    mockUseBackendStatus.mockReturnValue({
      isConnected: true,
      lastChecked: new Date(),
      checkStatus: jest.fn(),
    })
  })

  it('renders complete layout with header, main content, and footer', () => {
    render(
      <TestLayout>
        <div data-testid="main-content">Test Content</div>
      </TestLayout>
    )

    // Header elements
    expect(screen.getByText('Avail Explorer')).toBeInTheDocument()
    expect(screen.getByText('Mainnet')).toBeInTheDocument()
    expect(screen.getByTestId('status-badge')).toBeInTheDocument()

    // Main content
    expect(screen.getByTestId('main-content')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()

    // Footer elements
    expect(
      screen.getByText('Avail Explorer - Built with Next.js and Tailwind CSS')
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Blocks' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Transactions' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('© 2024 Avail Project. All rights reserved.')
    ).toBeInTheDocument()
  })

  it('applies correct layout structure classes', () => {
    const { container } = render(
      <TestLayout>
        <div>Test Content</div>
      </TestLayout>
    )

    // Check main layout container
    const layoutContainer = container.querySelector(
      '.relative.flex.min-h-screen.flex-col'
    )
    expect(layoutContainer).toBeInTheDocument()

    // Check header is sticky
    const header = container.querySelector('header')
    expect(header).toHaveClass('sticky', 'top-0', 'z-50')

    // Check main content has flex-1 and gradient
    const main = container.querySelector('main')
    expect(main).toHaveClass(
      'flex-1',
      'bg-gradient-to-br',
      'from-background',
      'to-muted/50'
    )

    // Check footer has proper spacing
    const footer = container.querySelector('footer')
    expect(footer).toHaveClass('border-t', 'mt-16')
  })

  it('maintains consistent navigation between header and footer', () => {
    render(
      <TestLayout>
        <div>Test Content</div>
      </TestLayout>
    )

    // Check that both header logo and footer links point to correct routes
    const headerLogo = screen.getByRole('link', { name: /avail explorer/i })
    expect(headerLogo).toHaveAttribute('href', '/')

    const footerBlocksLink = screen.getByRole('link', { name: 'Blocks' })
    expect(footerBlocksLink).toHaveAttribute('href', '/blocks')

    const footerTransactionsLink = screen.getByRole('link', {
      name: 'Transactions',
    })
    expect(footerTransactionsLink).toHaveAttribute('href', '/extrinsics')

    const footerDataSubmissionsLink = screen.getByRole('link', {
      name: 'Data Submissions',
    })
    expect(footerDataSubmissionsLink).toHaveAttribute(
      'href',
      '/data-submissions'
    )
  })

  it('displays chain data consistently in header', () => {
    render(
      <TestLayout>
        <div>Test Content</div>
      </TestLayout>
    )

    // Check that chain data is displayed in header
    expect(screen.getByText('AVAIL $0.12345678')).toBeInTheDocument()
    expect(screen.getByText('+5.67%')).toBeInTheDocument()
  })

  it('handles header refresh functionality', () => {
    const mockRefetch = jest.fn()
    mockUseChainData.mockReturnValue({
      data: null,
      loading: false,
      refreshing: false,
      error: null,
      refetch: mockRefetch,
    })

    render(
      <TestLayout>
        <div>Test Content</div>
      </TestLayout>
    )

    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)

    expect(mockRefetch).toHaveBeenCalledTimes(1)
    expect(mockRouter.refresh).toHaveBeenCalledTimes(1)
  })

  it('shows backend status correctly across layout', () => {
    mockUseBackendStatus.mockReturnValue({
      isConnected: false,
      lastChecked: new Date(),
      checkStatus: jest.fn(),
    })

    render(
      <TestLayout>
        <div>Test Content</div>
      </TestLayout>
    )

    expect(
      screen.getByText('Backend offline - using fallback')
    ).toBeInTheDocument()
  })

  it('handles error states in header while maintaining layout', () => {
    const mockError = new Error('Network error')
    mockUseChainData.mockReturnValue({
      data: null,
      loading: false,
      refreshing: false,
      error: mockError,
      refetch: jest.fn(),
    })

    render(
      <TestLayout>
        <div>Test Content</div>
      </TestLayout>
    )

    expect(screen.getByTestId('error-display')).toBeInTheDocument()
    expect(screen.getByText('Error: Network error')).toBeInTheDocument()

    // Footer should still be rendered normally
    expect(
      screen.getByText('© 2024 Avail Project. All rights reserved.')
    ).toBeInTheDocument()
  })

  it('maintains proper z-index stacking', () => {
    const { container } = render(
      <TestLayout>
        <div>Test Content</div>
      </TestLayout>
    )

    const header = container.querySelector('header')
    expect(header).toHaveClass('z-50')

    // Main content should not have conflicting z-index
    const main = container.querySelector('main')
    expect(main).not.toHaveClass('z-50')
  })

  it('provides proper semantic structure', () => {
    render(
      <TestLayout>
        <div>Test Content</div>
      </TestLayout>
    )

    // Check semantic HTML elements
    expect(screen.getByRole('banner')).toBeInTheDocument() // header
    expect(screen.getByRole('main')).toBeInTheDocument() // main
    expect(screen.getByRole('contentinfo')).toBeInTheDocument() // footer
  })

  it('handles loading states without breaking layout', () => {
    mockUseChainData.mockReturnValue({
      data: null,
      loading: true,
      refreshing: false,
      error: null,
      refetch: jest.fn(),
    })

    render(
      <TestLayout>
        <div>Test Content</div>
      </TestLayout>
    )

    // Header should show loading state
    const refreshButton = screen.getByRole('button', { name: /loading/i })
    expect(refreshButton).toBeDisabled()

    // Layout structure should remain intact
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('supports responsive design across components', () => {
    const { container } = render(
      <TestLayout>
        <div>Test Content</div>
      </TestLayout>
    )

    // Header responsive elements
    const headerMainnetIndicator = container.querySelector('.hidden.md\\:flex')
    expect(headerMainnetIndicator).toBeInTheDocument()

    // Footer responsive elements
    const footerFlexContainer = container.querySelector(
      '.flex.flex-col.md\\:flex-row'
    )
    expect(footerFlexContainer).toBeInTheDocument()

    const footerTextAlignment = container.querySelector(
      '.text-center.md\\:text-left'
    )
    expect(footerTextAlignment).toBeInTheDocument()
  })
})
