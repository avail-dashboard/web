# Avail DA Explorer Test Suite

This comprehensive test suite covers all aspects of the Avail DA Explorer application, including API endpoints, WebSocket functionality, and end-to-end user workflows.

## Test Structure

```
src/__tests__/
├── integration/           # API integration tests
│   ├── api/              # API endpoint tests
│   │   ├── health.test.ts
│   │   ├── blocks.test.ts
│   │   ├── extrinsics.test.ts
│   │   └── search.test.ts
│   └── websocket/        # WebSocket tests
│       └── realtime.test.ts
├── e2e/                  # End-to-end tests
│   └── explorer-workflows.spec.ts
├── mocks/                # Mock data and handlers
│   ├── data/            # Mock response data
│   │   ├── blocks.ts
│   │   ├── extrinsics.ts
│   │   ├── health.ts
│   │   ├── accounts.ts
│   │   └── search.ts
│   └── handlers/        # MSW request handlers
│       └── index.ts
├── setup/               # Test configuration
│   └── msw.ts          # MSW server setup
├── types/               # TypeScript interfaces
│   └── api.ts          # API response types
└── README.md           # This file
```

## Test Types

### 1. Integration Tests (Jest + MSW)

**Location:** `src/__tests__/integration/`

These tests verify that API endpoints work correctly with mocked backend responses.

#### API Endpoint Tests

- **Health endpoints** - `/health` and `/api/health`
- **Blocks API** - `/api/blocks` and `/api/blocks/{id}`
- **Extrinsics API** - `/api/extrinsics` and `/api/extrinsics/{hash}`
- **Search API** - `/api/search`
- **Accounts API** - `/api/accounts/{address}`

#### WebSocket Tests

- Connection management
- Block subscriptions
- Extrinsic subscriptions
- Chain statistics subscriptions
- Error handling and reconnection

### 2. End-to-End Tests (Playwright)

**Location:** `src/__tests__/e2e/`

These tests simulate real user interactions with the application.

#### Covered Workflows

- Navigation and layout
- Search functionality (including cmd+k)
- Blocks exploration and pagination
- Extrinsics filtering and details
- Account exploration
- Real-time updates
- Error handling
- Performance and accessibility

### 3. Mock Data Strategy

**Location:** `src/__tests__/mocks/`

All tests use realistic mock data that matches the API documentation:

- **MSW Handlers** - Intercept HTTP requests and return mock responses
- **Realistic Data** - Based on actual API response examples
- **Edge Cases** - Error scenarios, empty responses, pagination
- **TypeScript Types** - Strongly typed mock data

## Running Tests

### All Tests

```bash
npm test
```

### Integration Tests Only

```bash
npm test -- --testPathPattern=integration
```

### E2E Tests Only

```bash
npm run test:e2e
```

### With Coverage

```bash
npm run test:coverage
```

### Watch Mode

```bash
npm run test:watch
```

### CI Mode

```bash
npm run test:ci
```

## Test Configuration

### Environment Variables

```bash
# API Base URL for testing
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# WebSocket URL for testing
NEXT_PUBLIC_WS_URL=http://localhost:3001

# Playwright test URL
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
```

### Jest Configuration

- **Framework:** Jest with Next.js integration
- **Environment:** jsdom for React component testing
- **Mocking:** MSW for API mocking
- **Coverage:** Comprehensive coverage reporting
- **TypeScript:** Full TypeScript support

### Playwright Configuration

- **Browsers:** Chromium, Firefox, Safari
- **Parallel:** Tests run in parallel for speed
- **Screenshots:** Automatic screenshots on failure
- **Video:** Recording for debugging

## Test Coverage

### Core Functionality (✅ Implemented)

- [x] Health endpoints
- [x] Blocks API (list and details)
- [x] Extrinsics API (list and filtering)
- [x] Search functionality
- [x] Account details
- [x] WebSocket real-time updates
- [x] Error handling
- [x] Pagination
- [x] User workflows

### Extended Features (Future)

- [ ] Data submissions API
- [ ] Validators API
- [ ] Rollups API
- [ ] Analytics endpoints
- [ ] Performance testing
- [ ] Load testing

## Mock Data Examples

### Block Response

```typescript
{
  success: true,
  data: {
    number: 1000000,
    hash: "0x1234567890abcdef...",
    timestamp: 1704067200000,
    extrinsics: 5,
    finalized: true
  },
  meta: {
    source: "rpc"
  }
}
```

### Extrinsic Response

```typescript
{
  success: true,
  data: [{
    hash: "0x1234567890abcdef...",
    blockNumber: 1000000,
    module: "DataAvailability",
    call: "submit_data",
    success: true,
    args: {
      data: "0x48656c6c6f20576f726c64",
      appId: 1
    }
  }],
  meta: {
    page: 1,
    limit: 10,
    total: 500000,
    source: "rpc"
  }
}
```

## Error Testing

### API Error Scenarios

- Backend timeout (503)
- Invalid parameters (400)
- Not found (404)
- Internal server error (500)

### WebSocket Error Scenarios

- Connection failures
- Invalid subscriptions
- Reconnection logic
- Network interruptions

### E2E Error Scenarios

- 404 pages
- Network failures
- Invalid navigation
- Accessibility issues

## Best Practices

### Writing Tests

1. **Use descriptive test names** that explain what is being tested
2. **Test both success and failure scenarios**
3. **Use proper TypeScript types** for all test data
4. **Mock external dependencies** consistently
5. **Test user workflows** from the user's perspective

### Mock Data

1. **Use realistic data** based on actual API responses
2. **Include edge cases** like empty arrays and null values
3. **Maintain consistency** across different test files
4. **Update mocks** when API changes

### E2E Tests

1. **Test critical user paths** first
2. **Use data-testid attributes** for reliable element selection
3. **Handle async operations** properly with waitFor
4. **Test accessibility** and keyboard navigation
5. **Keep tests independent** and idempotent

## Debugging Tests

### Jest Tests

```bash
# Run specific test file
npm test blocks.test.ts

# Run with verbose output
npm test -- --verbose

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright Tests

```bash
# Run with UI mode
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug specific test
npx playwright test --debug explorer-workflows.spec.ts
```

### Common Issues

1. **MSW not intercepting requests**

   - Check that MSW server is started in jest.setup.js
   - Verify request URLs match handler patterns

2. **WebSocket tests failing**

   - WebSocket server may not be running
   - Tests gracefully skip if WebSocket unavailable

3. **E2E tests timing out**

   - Increase timeout in playwright.config.ts
   - Use proper wait strategies

4. **Type errors in tests**
   - Ensure all mock data matches TypeScript interfaces
   - Update types when API changes

## Contributing

When adding new tests:

1. **Follow the existing structure** and naming conventions
2. **Add appropriate mock data** in the mocks directory
3. **Update this README** if adding new test categories
4. **Ensure tests pass** in CI environment
5. **Add proper TypeScript types** for new interfaces

## Continuous Integration

Tests are configured to run in CI with:

- **Parallel execution** for speed
- **Coverage reporting** with thresholds
- **Artifact collection** (screenshots, videos)
- **Multiple browser testing** for E2E tests
- **Automatic retries** for flaky tests

The test suite is designed to be **fast**, **reliable**, and **comprehensive**, providing confidence in the application's functionality across all layers.
