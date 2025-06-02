import React from 'react'
import { render, screen } from '@testing-library/react'
import { Footer } from '../Footer'

describe('Footer Component', () => {
  it('renders the footer structure correctly', () => {
    render(<Footer />)

    // Check main footer element
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass(
      'border-t',
      'bg-card/95',
      'backdrop-blur',
      'mt-16'
    )
  })

  it('displays the correct branding text', () => {
    render(<Footer />)

    expect(
      screen.getByText('Avail Explorer - Built with Next.js and Tailwind CSS')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Exploring the Avail blockchain network')
    ).toBeInTheDocument()
  })

  it('displays the copyright text', () => {
    render(<Footer />)

    expect(
      screen.getByText('© 2024 Avail Project. All rights reserved.')
    ).toBeInTheDocument()
  })

  it('renders all navigation links with correct hrefs', () => {
    render(<Footer />)

    // Check internal navigation links
    const blocksLink = screen.getByRole('link', { name: 'Blocks' })
    expect(blocksLink).toHaveAttribute('href', '/blocks')

    const transactionsLink = screen.getByRole('link', { name: 'Transactions' })
    expect(transactionsLink).toHaveAttribute('href', '/extrinsics')

    const dataSubmissionsLink = screen.getByRole('link', {
      name: 'Data Submissions',
    })
    expect(dataSubmissionsLink).toHaveAttribute('href', '/data-submissions')

    // Check external documentation link
    const docsLink = screen.getByRole('link', { name: 'Docs' })
    expect(docsLink).toHaveAttribute('href', 'https://docs.availproject.org')
    expect(docsLink).toHaveAttribute('target', '_blank')
    expect(docsLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('applies correct CSS classes for styling', () => {
    const { container } = render(<Footer />)
    const footer = container.querySelector('footer')

    expect(footer).toHaveClass(
      'border-t',
      'bg-card/95',
      'backdrop-blur',
      'supports-[backdrop-filter]:bg-card/60',
      'mt-16'
    )
  })

  it('has responsive layout classes', () => {
    const { container } = render(<Footer />)

    // Check for responsive flex classes
    const mainContainer = container.querySelector(
      '.flex.flex-col.md\\:flex-row'
    )
    expect(mainContainer).toBeInTheDocument()

    // Check for responsive text alignment
    const brandingSection = container.querySelector(
      '.text-center.md\\:text-left'
    )
    expect(brandingSection).toBeInTheDocument()
  })

  it('renders navigation links with hover effects', () => {
    render(<Footer />)

    const blocksLink = screen.getByRole('link', { name: 'Blocks' })
    expect(blocksLink).toHaveClass(
      'text-muted-foreground',
      'hover:text-avail-600',
      'transition-colors'
    )

    const transactionsLink = screen.getByRole('link', { name: 'Transactions' })
    expect(transactionsLink).toHaveClass(
      'text-muted-foreground',
      'hover:text-avail-600',
      'transition-colors'
    )

    const dataSubmissionsLink = screen.getByRole('link', {
      name: 'Data Submissions',
    })
    expect(dataSubmissionsLink).toHaveClass(
      'text-muted-foreground',
      'hover:text-avail-600',
      'transition-colors'
    )

    const docsLink = screen.getByRole('link', { name: 'Docs' })
    expect(docsLink).toHaveClass(
      'text-muted-foreground',
      'hover:text-avail-600',
      'transition-colors'
    )
  })

  it('has proper semantic structure', () => {
    render(<Footer />)

    // Should be wrapped in a footer element
    const footer = screen.getByRole('contentinfo')
    expect(footer.tagName).toBe('FOOTER')

    // Should have container structure
    const container = footer.querySelector('.container')
    expect(container).toBeInTheDocument()
  })

  it('displays all required sections', () => {
    render(<Footer />)

    // Branding section
    expect(
      screen.getByText('Avail Explorer - Built with Next.js and Tailwind CSS')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Exploring the Avail blockchain network')
    ).toBeInTheDocument()

    // Navigation section
    expect(screen.getByRole('link', { name: 'Blocks' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Transactions' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Data Submissions' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Docs' })).toBeInTheDocument()

    // Copyright section
    expect(
      screen.getByText('© 2024 Avail Project. All rights reserved.')
    ).toBeInTheDocument()
  })

  it('has correct spacing and layout structure', () => {
    const { container } = render(<Footer />)

    // Check main container padding
    const mainContainer = container.querySelector(
      '.container.mx-auto.px-4.py-6'
    )
    expect(mainContainer).toBeInTheDocument()

    // Check spacing between sections
    const spacingContainer = container.querySelector(
      '.space-y-4.md\\:space-y-0'
    )
    expect(spacingContainer).toBeInTheDocument()

    // Check navigation links spacing
    const navContainer = container.querySelector('.space-x-6')
    expect(navContainer).toBeInTheDocument()
  })

  it('renders with proper accessibility attributes', () => {
    render(<Footer />)

    // External link should have proper attributes for accessibility
    const docsLink = screen.getByRole('link', { name: 'Docs' })
    expect(docsLink).toHaveAttribute('target', '_blank')
    expect(docsLink).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
