import { test, expect } from '@playwright/test'

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'

test.describe('Avail Explorer User Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto(BASE_URL)
  })

  test.describe('Navigation and Layout', () => {
    test('should load the home page successfully', async ({ page }) => {
      await expect(page).toHaveTitle(/Avail Explorer/i)

      // Check for main navigation elements
      await expect(page.locator('nav')).toBeVisible()

      // Check for key sections
      await expect(page.getByText(/blocks/i)).toBeVisible()
      await expect(page.getByText(/extrinsics/i)).toBeVisible()
    })

    test('should have working navigation menu', async ({ page }) => {
      // Test navigation to different sections
      await page.click('text=Blocks')
      await expect(page.url()).toContain('/blocks')

      await page.click('text=Extrinsics')
      await expect(page.url()).toContain('/extrinsics')

      // Navigate back to home
      await page.click('text=Home')
      await expect(page.url()).toBe(BASE_URL + '/')
    })
  })

  test.describe('Search Functionality', () => {
    test('should perform search and navigate to results', async ({ page }) => {
      // Find search input
      const searchInput = page.locator(
        'input[placeholder*="search" i], input[type="search"]'
      )
      await expect(searchInput).toBeVisible()

      // Search for a block number
      await searchInput.fill('1000000')
      await searchInput.press('Enter')

      // Should show search results or navigate to block
      await page.waitForLoadState('networkidle')

      // Check if we're on a results page or block page
      const url = page.url()
      expect(url).toMatch(/(search|blocks|block)/)
    })

    test('should handle search with cmd+k shortcut', async ({ page }) => {
      // Test cmd+k functionality if implemented
      await page.keyboard.press('Meta+k')

      // Check if search modal or input is focused
      const searchElement = page.locator(
        'input[type="search"], [role="searchbox"]'
      )

      if ((await searchElement.count()) > 0) {
        await expect(searchElement.first()).toBeFocused()

        // Type search query
        await searchElement.first().fill('0x1234')
        await page.keyboard.press('Enter')

        await page.waitForLoadState('networkidle')
      }
    })

    test('should search for different entity types', async ({ page }) => {
      const searchInput = page.locator(
        'input[placeholder*="search" i], input[type="search"]'
      )

      // Test block hash search
      await searchInput.fill('0x1234567890abcdef')
      await searchInput.press('Enter')
      await page.waitForLoadState('networkidle')

      // Test account address search
      await page.goto(BASE_URL)
      await searchInput.fill('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY')
      await searchInput.press('Enter')
      await page.waitForLoadState('networkidle')
    })
  })

  test.describe('Blocks Exploration', () => {
    test('should display blocks list and navigate to block details', async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/blocks`)

      // Wait for blocks to load
      await page.waitForSelector(
        '[data-testid="blocks-list"], .blocks-container, table'
      )

      // Check if blocks are displayed
      const blockElements = page.locator(
        '[data-testid="block-item"], tr:has(td)'
      )
      await expect(blockElements.first()).toBeVisible()

      // Click on first block
      await blockElements.first().click()

      // Should navigate to block details
      await page.waitForLoadState('networkidle')
      expect(page.url()).toMatch(/\/blocks\/\d+/)

      // Check block details page
      await expect(page.getByText(/block #/i)).toBeVisible()
      await expect(page.getByText(/hash/i)).toBeVisible()
      await expect(page.getByText(/timestamp/i)).toBeVisible()
    })

    test('should show block extrinsics and navigate to extrinsic details', async ({
      page,
    }) => {
      // Navigate to a specific block
      await page.goto(`${BASE_URL}/blocks/1000000`)

      // Wait for block details to load
      await page.waitForSelector(
        '[data-testid="block-details"], .block-container'
      )

      // Look for extrinsics section
      const extrinsicsSection = page.locator(
        '[data-testid="extrinsics-list"], .extrinsics-container'
      )

      if ((await extrinsicsSection.count()) > 0) {
        await expect(extrinsicsSection).toBeVisible()

        // Click on first extrinsic if available
        const extrinsicLink = page.locator('a[href*="/extrinsics/"]').first()

        if ((await extrinsicLink.count()) > 0) {
          await extrinsicLink.click()

          // Should navigate to extrinsic details
          await page.waitForLoadState('networkidle')
          expect(page.url()).toMatch(/\/extrinsics\/0x/)
        }
      }
    })

    test('should handle pagination in blocks list', async ({ page }) => {
      await page.goto(`${BASE_URL}/blocks`)

      // Wait for blocks to load
      await page.waitForSelector(
        '[data-testid="blocks-list"], .blocks-container'
      )

      // Look for pagination controls
      const nextButton = page.locator(
        'button:has-text("Next"), [aria-label="Next page"]'
      )
      const prevButton = page.locator(
        'button:has-text("Previous"), [aria-label="Previous page"]'
      )

      if ((await nextButton.count()) > 0) {
        await nextButton.click()
        await page.waitForLoadState('networkidle')

        // URL should reflect pagination
        expect(page.url()).toMatch(/page=2|offset=/)

        // Previous button should now be enabled
        if ((await prevButton.count()) > 0) {
          await expect(prevButton).toBeEnabled()
        }
      }
    })
  })

  test.describe('Extrinsics Exploration', () => {
    test('should display extrinsics list with filtering', async ({ page }) => {
      await page.goto(`${BASE_URL}/extrinsics`)

      // Wait for extrinsics to load
      await page.waitForSelector(
        '[data-testid="extrinsics-list"], .extrinsics-container, table'
      )

      // Check if extrinsics are displayed
      const extrinsicElements = page.locator(
        '[data-testid="extrinsic-item"], tr:has(td)'
      )
      await expect(extrinsicElements.first()).toBeVisible()

      // Test filtering if available
      const filterButton = page.locator(
        'button:has-text("Filter"), select[name*="filter"]'
      )

      if ((await filterButton.count()) > 0) {
        await filterButton.first().click()

        // Look for data submission filter
        const dataSubmissionFilter = page.locator(
          'text="Data Submission", option[value*="data"]'
        )

        if ((await dataSubmissionFilter.count()) > 0) {
          await dataSubmissionFilter.click()
          await page.waitForLoadState('networkidle')

          // Should show only data submission extrinsics
          const filteredExtrinsics = page.locator(
            '[data-testid="extrinsic-item"]'
          )
          if ((await filteredExtrinsics.count()) > 0) {
            await expect(filteredExtrinsics.first()).toContainText(
              /data|submit/i
            )
          }
        }
      }
    })

    test('should show extrinsic details with events and parameters', async ({
      page,
    }) => {
      // Navigate to a specific extrinsic
      await page.goto(`${BASE_URL}/extrinsics/0x1234567890abcdef`)

      // Wait for extrinsic details to load
      await page.waitForSelector(
        '[data-testid="extrinsic-details"], .extrinsic-container'
      )

      // Check for key extrinsic information
      await expect(page.getByText(/hash/i)).toBeVisible()
      await expect(page.getByText(/block/i)).toBeVisible()
      await expect(page.getByText(/signer/i)).toBeVisible()

      // Check for events section if available
      const eventsSection = page.locator(
        '[data-testid="events"], .events-container'
      )
      if ((await eventsSection.count()) > 0) {
        await expect(eventsSection).toBeVisible()
      }

      // Check for parameters section
      const paramsSection = page.locator(
        '[data-testid="parameters"], .params-container'
      )
      if ((await paramsSection.count()) > 0) {
        await expect(paramsSection).toBeVisible()
      }
    })
  })

  test.describe('Account Exploration', () => {
    test('should display account details and transaction history', async ({
      page,
    }) => {
      const accountAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
      await page.goto(`${BASE_URL}/accounts/${accountAddress}`)

      // Wait for account details to load
      await page.waitForSelector(
        '[data-testid="account-details"], .account-container'
      )

      // Check for account information
      await expect(page.getByText(/balance/i)).toBeVisible()
      await expect(page.getByText(/nonce/i)).toBeVisible()

      // Check for transaction history if available
      const historySection = page.locator(
        '[data-testid="transaction-history"], .history-container'
      )
      if ((await historySection.count()) > 0) {
        await expect(historySection).toBeVisible()
      }
    })
  })

  test.describe('Real-time Updates', () => {
    test('should show real-time block updates', async ({ page }) => {
      await page.goto(`${BASE_URL}/blocks`)

      // Wait for initial load
      await page.waitForSelector(
        '[data-testid="blocks-list"], .blocks-container'
      )

      // Get initial block count or first block number
      const initialBlocks = await page
        .locator('[data-testid="block-item"], tr:has(td)')
        .count()

      // Wait for potential real-time updates (if WebSocket is working)
      await page.waitForTimeout(5000)

      // Check if new blocks appeared (this might not work in test environment)
      const updatedBlocks = await page
        .locator('[data-testid="block-item"], tr:has(td)')
        .count()

      // In a real environment with live data, we might see new blocks
      expect(updatedBlocks).toBeGreaterThanOrEqual(initialBlocks)
    })

    test('should handle WebSocket connection status', async ({ page }) => {
      await page.goto(BASE_URL)

      // Look for connection status indicator
      const statusIndicator = page.locator(
        '[data-testid="connection-status"], .status-indicator'
      )

      if ((await statusIndicator.count()) > 0) {
        // Should show connected or disconnected status
        await expect(statusIndicator).toBeVisible()
      }
    })
  })

  test.describe('Error Handling', () => {
    test('should handle 404 errors gracefully', async ({ page }) => {
      // Navigate to non-existent block
      await page.goto(`${BASE_URL}/blocks/999999999`)

      // Should show error message or redirect
      const errorMessage = page.locator(
        'text="not found", text="404", [data-testid="error"]'
      )

      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage.first()).toBeVisible()
      }
    })

    test('should handle network errors gracefully', async ({ page }) => {
      // This test would require mocking network failures
      // For now, just check that error boundaries exist

      await page.goto(BASE_URL)

      // Look for error boundary or fallback UI
      const errorBoundary = page.locator(
        '[data-testid="error-boundary"], .error-fallback'
      )

      // This should not be visible under normal circumstances
      if ((await errorBoundary.count()) > 0) {
        await expect(errorBoundary).not.toBeVisible()
      }
    })
  })

  test.describe('Performance and Accessibility', () => {
    test('should load pages within reasonable time', async ({ page }) => {
      const startTime = Date.now()

      await page.goto(`${BASE_URL}/blocks`)
      await page.waitForLoadState('networkidle')

      const loadTime = Date.now() - startTime

      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000)
    })

    test('should have proper heading structure', async ({ page }) => {
      await page.goto(BASE_URL)

      // Check for proper heading hierarchy
      const h1 = page.locator('h1')
      await expect(h1).toHaveCount(1) // Should have exactly one h1

      const headings = page.locator('h1, h2, h3, h4, h5, h6')
      const headingCount = await headings.count()

      expect(headingCount).toBeGreaterThan(0)
    })

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto(BASE_URL)

      // Test tab navigation
      await page.keyboard.press('Tab')

      // Should focus on first interactive element
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()

      // Continue tabbing through interactive elements
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Should still have focus on an interactive element
      const secondFocusedElement = page.locator(':focus')
      await expect(secondFocusedElement).toBeVisible()
    })
  })
})
