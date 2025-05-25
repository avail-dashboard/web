import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../card'

describe('Card Components', () => {
  describe('Card', () => {
    it('should render correctly', () => {
      render(<Card data-testid="card">Card content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveTextContent('Card content')
    })

    it('should apply custom className', () => {
      render(<Card className="custom-class" data-testid="card" />)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
    })

    it('should have default styling classes', () => {
      render(<Card data-testid="card" />)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass(
        'rounded-lg',
        'border',
        'bg-card',
        'text-card-foreground',
        'shadow-sm'
      )
    })
  })

  describe('CardHeader', () => {
    it('should render correctly', () => {
      render(<CardHeader data-testid="card-header">Header content</CardHeader>)
      const header = screen.getByTestId('card-header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveTextContent('Header content')
    })

    it('should have default styling classes', () => {
      render(<CardHeader data-testid="card-header" />)
      const header = screen.getByTestId('card-header')
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
    })
  })

  describe('CardTitle', () => {
    it('should render as h3 element', () => {
      render(<CardTitle>Title content</CardTitle>)
      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('Title content')
    })

    it('should have default styling classes', () => {
      render(<CardTitle data-testid="card-title">Title</CardTitle>)
      const title = screen.getByTestId('card-title')
      expect(title).toHaveClass(
        'text-2xl',
        'font-semibold',
        'leading-none',
        'tracking-tight'
      )
    })
  })

  describe('CardDescription', () => {
    it('should render as paragraph element', () => {
      render(<CardDescription>Description content</CardDescription>)
      const description = screen.getByText('Description content')
      expect(description).toBeInTheDocument()
      expect(description.tagName).toBe('P')
    })

    it('should have default styling classes', () => {
      render(
        <CardDescription data-testid="card-description">
          Description
        </CardDescription>
      )
      const description = screen.getByTestId('card-description')
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })
  })

  describe('CardContent', () => {
    it('should render correctly', () => {
      render(<CardContent data-testid="card-content">Content</CardContent>)
      const content = screen.getByTestId('card-content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveTextContent('Content')
    })

    it('should have default styling classes', () => {
      render(<CardContent data-testid="card-content" />)
      const content = screen.getByTestId('card-content')
      expect(content).toHaveClass('p-6', 'pt-0')
    })
  })

  describe('CardFooter', () => {
    it('should render correctly', () => {
      render(<CardFooter data-testid="card-footer">Footer content</CardFooter>)
      const footer = screen.getByTestId('card-footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveTextContent('Footer content')
    })

    it('should have default styling classes', () => {
      render(<CardFooter data-testid="card-footer" />)
      const footer = screen.getByTestId('card-footer')
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
    })
  })

  describe('Complete Card', () => {
    it('should render a complete card with all components', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Test Content</p>
          </CardContent>
          <CardFooter>
            <button>Test Button</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByTestId('complete-card')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'Test Title'
      )
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
      expect(screen.getByRole('button')).toHaveTextContent('Test Button')
    })
  })
})
