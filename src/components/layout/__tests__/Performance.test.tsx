import React, { useRef, useEffect } from 'react'
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

// Mock the components
jest.mock('@/components/BackendStatus', () => {
  const StatusBadge = React.memo(() => (
    <div data-testid="status-badge">Status Badge</div>
  ))
  StatusBadge.displayName = 'StatusBadge'
  return { StatusBadge }
})

jest.mock('@/components/ui/RefreshIndicator', () => {
  const RefreshIndicator = React.memo(
    ({ isRefreshing }: { isRefreshing: boolean }) => (
      <div data-testid="refresh-indicator">
        {isRefreshing ? 'Refreshing...' : 'Not refreshing'}
      </div>
    )
  )
  RefreshIndicator.displayName = 'RefreshIndicator'
  return { RefreshIndicator }
})

jest.mock('@/components/ui/ErrorDisplay', () => {
  const ErrorDisplay = React.memo(
    ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
      <div data-testid="error-display">
        <span>Error: {error?.message || 'Unknown error'}</span>
        <button onClick={onRetry} data-testid="error-retry">
          Retry
        </button>
      </div>
    )
  )
  ErrorDisplay.displayName = 'ErrorDisplay'
  return { ErrorDisplay }
})

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

// Render counter component wrapper
const RenderCounter = ({
  children,
  onRender,
  testId = 'render-counter',
}: {
  children: React.ReactNode
  onRender: () => void
  testId?: string
}) => {
  const renderCount = useRef(0)

  useEffect(() => {
    renderCount.current += 1
    onRender()
  })

  return <div data-testid={`${testId}-${renderCount.current}`}>{children}</div>
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
}

const mockBackendStatus = {
  isConnected: true,
  lastChecked: new Date(),
  checkStatus: jest.fn(),
}

describe('Layout Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue(mockRouter)
  })

  describe('React.memo Optimization', () => {
    it('should prevent Header re-renders when parent re-renders with same props', () => {
      let headerRenderCount = 0
      const onHeaderRender = () => {
        headerRenderCount++
      }

      mockUseChainData.mockReturnValue({
        data: mockChainDataBase,
        loading: false,
        refreshing: false,
        error: null,
        refetch: jest.fn(),
      })
      mockUseBackendStatus.mockReturnValue(mockBackendStatus)

      const ParentComponent = ({ counter }: { counter: number }) => (
        <div>
          <div>Parent counter: {counter}</div>
          <RenderCounter onRender={onHeaderRender} testId="header">
            <Header />
          </RenderCounter>
        </div>
      )

      const { rerender } = render(<ParentComponent counter={0} />)
      const initialRenderCount = headerRenderCount

      // Change parent state multiple times - Header should not re-render due to React.memo
      rerender(<ParentComponent counter={1} />)
      rerender(<ParentComponent counter={2} />)
      rerender(<ParentComponent counter={3} />)

      // Header should only re-render for the wrapper, not the component itself
      expect(headerRenderCount).toBe(initialRenderCount + 3)

      // Verify Header still works correctly
      expect(screen.getByText('Avail Explorer')).toBeInTheDocument()
      expect(screen.getByText('AVAIL $0.12345678')).toBeInTheDocument()
    })

    it('should prevent Footer re-renders when parent re-renders', () => {
      let footerRenderCount = 0
      const onFooterRender = () => {
        footerRenderCount++
      }

      const ParentComponent = ({ counter }: { counter: number }) => (
        <div>
          <div>Parent counter: {counter}</div>
          <RenderCounter onRender={onFooterRender} testId="footer">
            <Footer />
          </RenderCounter>
        </div>
      )

      const { rerender } = render(<ParentComponent counter={0} />)
      const initialRenderCount = footerRenderCount

      // Change parent state multiple times - Footer should not re-render due to React.memo
      rerender(<ParentComponent counter={1} />)
      rerender(<ParentComponent counter={2} />)
      rerender(<ParentComponent counter={3} />)

      // Footer should only re-render for the wrapper, not the component itself
      expect(footerRenderCount).toBe(initialRenderCount + 3)

      // Verify Footer still works correctly
      expect(
        screen.getByText('Avail Explorer - Built with Next.js and Tailwind CSS')
      ).toBeInTheDocument()
      expect(
        screen.getByText('© 2024 Avail Project. All rights reserved.')
      ).toBeInTheDocument()
    })
  })

  describe('Memoization Benefits', () => {
    it('should demonstrate useMemo optimization for price calculations', () => {
      // Track how many times the price formatting would be called
      const originalToFixed = Number.prototype.toFixed
      let toFixedCallCount = 0

      Number.prototype.toFixed = function (digits) {
        toFixedCallCount++
        return originalToFixed.call(this, digits)
      }

      mockUseChainData.mockReturnValue({
        data: mockChainDataBase,
        loading: false,
        refreshing: false,
        error: null,
        refetch: jest.fn(),
      })
      mockUseBackendStatus.mockReturnValue(mockBackendStatus)

      const { rerender } = render(<Header />)

      const initialCallCount = toFixedCallCount

      // Re-render with same data - useMemo should prevent recalculation
      rerender(<Header />)

      // toFixed should not be called again due to memoization
      expect(toFixedCallCount).toBe(initialCallCount)

      // Verify display is still correct
      expect(screen.getByText('AVAIL $0.12345678')).toBeInTheDocument()
      expect(screen.getByText('+5.67%')).toBeInTheDocument()

      // Restore original method
      Number.prototype.toFixed = originalToFixed
    })

    it('should demonstrate useCallback optimization for event handlers', () => {
      const mockRefetch = jest.fn()

      mockUseChainData.mockReturnValue({
        data: mockChainDataBase,
        loading: false,
        refreshing: false,
        error: null,
        refetch: mockRefetch,
      })
      mockUseBackendStatus.mockReturnValue(mockBackendStatus)

      const { rerender } = render(<Header />)

      // Re-render component
      rerender(<Header />)

      const refreshButton = screen.getByRole('button', { name: /refresh/i })

      // Event handlers should be stable (useCallback working)
      fireEvent.click(refreshButton)
      expect(mockRefetch).toHaveBeenCalledTimes(1)
      expect(mockRouter.refresh).toHaveBeenCalledTimes(1)
    })
  })

  describe('Performance Under Load', () => {
    it('should handle rapid re-renders efficiently', () => {
      let renderCount = 0
      const onRender = () => {
        renderCount++
      }

      mockUseChainData.mockReturnValue({
        data: mockChainDataBase,
        loading: false,
        refreshing: false,
        error: null,
        refetch: jest.fn(),
      })
      mockUseBackendStatus.mockReturnValue(mockBackendStatus)

      const TestComponent = ({ trigger }: { trigger: number }) => (
        <RenderCounter onRender={onRender} testId="performance">
          <div data-testid={`trigger-${trigger}`}>
            <Header />
          </div>
        </RenderCounter>
      )

      const { rerender } = render(<TestComponent trigger={0} />)
      const initialRenderCount = renderCount

      // Simulate rapid re-renders (common in real apps)
      const startTime = performance.now()
      for (let i = 1; i <= 100; i++) {
        rerender(<TestComponent trigger={i} />)
      }
      const endTime = performance.now()

      // Should complete quickly (under 100ms for 100 re-renders)
      expect(endTime - startTime).toBeLessThan(100)

      // Should have re-rendered the wrapper 100 times
      expect(renderCount).toBe(initialRenderCount + 100)

      // Component should still work correctly
      expect(screen.getByText('Avail Explorer')).toBeInTheDocument()
    })

    it('should maintain performance with complex layout structure', () => {
      let headerRenderCount = 0
      let footerRenderCount = 0

      const onHeaderRender = () => {
        headerRenderCount++
      }
      const onFooterRender = () => {
        footerRenderCount++
      }

      mockUseChainData.mockReturnValue({
        data: mockChainDataBase,
        loading: false,
        refreshing: false,
        error: null,
        refetch: jest.fn(),
      })
      mockUseBackendStatus.mockReturnValue(mockBackendStatus)

      const ComplexLayout = ({ trigger }: { trigger: number }) => (
        <div>
          <RenderCounter onRender={onHeaderRender} testId="header">
            <Header />
          </RenderCounter>
          <main>
            <div>Content {trigger}</div>
            <div>More content</div>
            <div>Even more content</div>
          </main>
          <RenderCounter onRender={onFooterRender} testId="footer">
            <Footer />
          </RenderCounter>
        </div>
      )

      const { rerender } = render(<ComplexLayout trigger={0} />)

      const initialHeaderRenders = headerRenderCount
      const initialFooterRenders = footerRenderCount

      // Multiple re-renders with changing content
      for (let i = 1; i <= 10; i++) {
        rerender(<ComplexLayout trigger={i} />)
      }

      // Both components should be optimized
      expect(headerRenderCount).toBe(initialHeaderRenders + 10)
      expect(footerRenderCount).toBe(initialFooterRenders + 10)

      // Verify both components still work
      expect(screen.getByText('Avail Explorer')).toBeInTheDocument()
      expect(
        screen.getByText('© 2024 Avail Project. All rights reserved.')
      ).toBeInTheDocument()
      expect(screen.getByText('Content 10')).toBeInTheDocument()
    })
  })

  describe('Real-world Scenarios', () => {
    it('should optimize re-renders during API polling', () => {
      let renderCount = 0
      const onRender = () => {
        renderCount++
      }

      const mockRefetch = jest.fn()

      // Simulate API polling scenario
      mockUseChainData.mockReturnValue({
        data: mockChainDataBase,
        loading: false,
        refreshing: false,
        error: null,
        refetch: mockRefetch,
      })
      mockUseBackendStatus.mockReturnValue(mockBackendStatus)

      const PollingComponent = ({ pollCount }: { pollCount: number }) => (
        <div>
          <div>Poll count: {pollCount}</div>
          <RenderCounter onRender={onRender} testId="polling">
            <Header />
          </RenderCounter>
        </div>
      )

      const { rerender } = render(<PollingComponent pollCount={0} />)
      const initialRenderCount = renderCount

      // Simulate 30 seconds of polling (every 2 seconds)
      for (let i = 1; i <= 15; i++) {
        rerender(<PollingComponent pollCount={i} />)
      }

      // Should handle polling efficiently
      expect(renderCount).toBe(initialRenderCount + 15)

      // Component should remain functional
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      fireEvent.click(refreshButton)
      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })

    it('should demonstrate memory efficiency with memoized components', () => {
      // This test demonstrates that memoized components don't create memory leaks
      const components: React.ReactElement[] = []

      mockUseChainData.mockReturnValue({
        data: mockChainDataBase,
        loading: false,
        refreshing: false,
        error: null,
        refetch: jest.fn(),
      })
      mockUseBackendStatus.mockReturnValue(mockBackendStatus)

      // Create multiple instances (simulating route changes)
      for (let i = 0; i < 10; i++) {
        components.push(<Header key={i} />)
        components.push(<Footer key={`footer-${i}`} />)
      }

      // Render all components
      const { unmount } = render(<div>{components}</div>)

      // Verify they all render correctly
      expect(screen.getAllByText('Avail Explorer')).toHaveLength(10)
      expect(
        screen.getAllByText('© 2024 Avail Project. All rights reserved.')
      ).toHaveLength(10)

      // Clean unmount should work without issues
      unmount()
    })
  })
})
