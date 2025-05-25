import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/')

    // Check if the page loads
    await expect(page).toHaveTitle(/Avail Explorer/i)

    // Check for main navigation or header elements
    await expect(page.locator('body')).toBeVisible()
  })

  test('should display dashboard components', async ({ page }) => {
    await page.goto('/')

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle')

    // Check if main content is visible
    await expect(
      page.locator('main, [role="main"], .main-content')
    ).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check if page is still functional on mobile
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle navigation', async ({ page }) => {
    await page.goto('/')

    // Check if navigation links work (if they exist)
    const navLinks = page.locator('nav a, [role="navigation"] a')
    const linkCount = await navLinks.count()

    if (linkCount > 0) {
      // Test first navigation link
      const firstLink = navLinks.first()
      const href = await firstLink.getAttribute('href')

      if (href && href.startsWith('/')) {
        await firstLink.click()
        await page.waitForLoadState('networkidle')
        await expect(page).toHaveURL(new RegExp(href))
      }
    }
  })
})
