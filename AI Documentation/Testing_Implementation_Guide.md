# Testing Implementation Guide

## Overview

This document outlines the comprehensive testing strategy implemented for the Avail Explorer Dashboard. The testing setup includes unit tests, integration tests, component tests, and end-to-end tests.

## Testing Stack

### 1. Unit & Integration Testing

- **Framework**: Jest + React Testing Library
- **Mocking**: MSW (Mock Service Worker)
- **Coverage**: 70% threshold for branches, functions, lines, and statements

### 2. End-to-End Testing

- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Features**: Cross-browser testing, mobile testing, visual regression

### 3. Code Quality

- **Linting**: ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky for pre-commit checks
- **Type Safety**: TypeScript strict mode

## Project Structure

```
├── src/
│   ├── __tests__/
│   │   └── setup/
│   │       └── server.ts          # MSW server setup
│   │   ├── components/
│   │   │   └── ui/
│   │   │       └── __tests__/
│   │   │           └── card.test.tsx   # Component tests
│   │   └── lib/
│   │       └── __tests__/
│   │           └── utils.test.ts       # Utility function tests
│   ├── e2e/
│   │   └── homepage.spec.ts            # E2E tests
│   ├── jest.config.js                 # Jest configuration
│   ├── jest.setup.js                  # Jest setup file
│   ├── playwright.config.ts           # Playwright configuration
│   └── .github/
│       └── workflows/
│           └── ci.yml                  # CI/CD pipeline
```

## Available Scripts

### Unit & Integration Tests

```bash
npm test                    # Run tests in watch mode
npm run test:coverage       # Run tests with coverage report
npm run test:ci            # Run tests in CI mode (no watch)
```

### End-to-End Tests

```bash
npm run test:e2e           # Run E2E tests headless
npm run test:e2e:headed    # Run E2E tests with browser UI
npm run test:e2e:ui        # Run E2E tests with Playwright UI
```

### Code Quality

```bash
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
npm run format:check       # Check code formatting
npm run type-check         # Run TypeScript type checking
```

## Writing Tests

### Unit Tests Example

```typescript
// src/lib/__tests__/utils.test.ts
import { formatNumber } from '../utils'

describe('formatNumber', () => {
  it('should format large numbers correctly', () => {
    expect(formatNumber(1500000)).toBe('1.50M')
  })
})
```

### Component Tests Example

```typescript
// src/components/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

### API Mocking Example

```typescript
// src/__tests__/setup/server.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/blocks', () => {
    return HttpResponse.json({ blocks: [] })
  }),
]
```

### E2E Tests Example

```typescript
// e2e/feature.spec.ts
import { test, expect } from '@playwright/test'

test('should navigate to blocks page', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Blocks')
  await expect(page).toHaveURL('/blocks')
})
```

## Testing Best Practices

### 1. Test Structure

- Use descriptive test names
- Group related tests with `describe` blocks
- Follow AAA pattern: Arrange, Act, Assert

### 2. Component Testing

- Test user interactions, not implementation details
- Use `data-testid` for reliable element selection
- Mock external dependencies

### 3. API Testing

- Mock all external API calls
- Test both success and error scenarios
- Verify loading states

### 4. E2E Testing

- Focus on critical user journeys
- Test across different browsers and devices
- Keep tests independent and isolated

## Coverage Requirements

The project maintains a 70% coverage threshold for:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## CI/CD Pipeline

### Pre-commit Hooks

Automatically run before each commit:

1. Code formatting check
2. Linting
3. Type checking
4. Unit tests

### GitHub Actions

Runs on every push and pull request:

1. **Test Job**: Unit tests, linting, type checking
2. **E2E Job**: End-to-end tests across browsers
3. **Build Job**: Application build verification

## Debugging Tests

### Jest Tests

```bash
# Debug specific test
npm test -- --testNamePattern="formatNumber"

# Run tests with verbose output
npm test -- --verbose

# Update snapshots
npm test -- --updateSnapshot
```

### Playwright Tests

```bash
# Debug with browser UI
npm run test:e2e:headed

# Debug with Playwright UI
npm run test:e2e:ui

# Run specific test file
npx playwright test homepage.spec.ts
```

## Performance Testing

### Lighthouse CI (Future Enhancement)

- Performance budgets
- Accessibility checks
- SEO validation
- Best practices verification

### Load Testing (Future Enhancement)

- API endpoint stress testing
- Database performance monitoring
- Real user monitoring (RUM)

## Monitoring & Alerting

### Test Metrics

- Test execution time
- Flaky test detection
- Coverage trends
- Performance regression alerts

### Runtime Monitoring

- Error tracking with Sentry
- Performance monitoring
- API health checks
- User experience metrics

## Troubleshooting

### Common Issues

1. **Tests failing in CI but passing locally**

   - Check Node.js version compatibility
   - Verify environment variables
   - Review timing issues in async tests

2. **Flaky E2E tests**

   - Add proper wait conditions
   - Use `page.waitForLoadState('networkidle')`
   - Increase timeout for slow operations

3. **Coverage not meeting threshold**
   - Identify uncovered code with `npm run test:coverage`
   - Add tests for critical paths
   - Consider excluding non-critical files

## Next Steps

1. **Phase 2**: Add visual regression testing
2. **Phase 3**: Implement performance testing
3. **Phase 4**: Add accessibility testing
4. **Phase 5**: Set up monitoring and alerting

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [MSW Documentation](https://mswjs.io/docs/)
