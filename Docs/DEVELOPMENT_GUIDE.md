# Avail Dashboard Development Guide

## 🎯 **Current Status**

✅ **Phase 1 Complete**

- ✅ Modern Next.js 14 dashboard with TypeScript
- ✅ Real API integration (3 options: Subscan, RPC, SubQuery)
- ✅ Interactive charts (token distribution, block activity)
- ✅ Search functionality
- ✅ Responsive design with Tailwind CSS
- ✅ Auto-refresh every 30 seconds

## 🔄 **Why Multiple Data Sources?**

### **Option 1: Subscan API** ⭐ **RECOMMENDED FOR PRODUCTION**

```typescript
// Pros:
✅ Pre-indexed historical data
✅ Fast queries (no blockchain scanning)
✅ REST API - easy integration
✅ Proven reliability (used by many explorers)

// Cons:
❌ Third-party dependency
❌ Potential API rate limits
❌ Limited customization
```

**Use When:** Building production apps quickly, need historical data, want proven infrastructure.

### **Option 2: Direct RPC** ⚡ **BEST FOR REAL-TIME**

```typescript
// Pros:
✅ Real-time data directly from blockchain
✅ No third-party dependencies
✅ Full control over data
✅ Lower latency for recent blocks

// Cons:
❌ No historical data indexing
❌ Higher infrastructure costs
❌ Complex for advanced queries
```

**Use When:** Need real-time data, building custom features, want full control.

### **Option 3: SubQuery GraphQL** 🎯 **BEST LONG-TERM**

```typescript
// Pros:
✅ Custom indexing logic
✅ GraphQL flexibility
✅ Open source
✅ Optimized queries

// Cons:
❌ Setup complexity
❌ Infrastructure maintenance
❌ Learning curve
```

**Use When:** Building custom analytics, need complex queries, want full data control.

## 🚀 **Phase 2 Roadmap**

### **Next Features to Build**

#### 1. **Advanced Block Explorer** (Next 2-3 days)

```typescript
// Create these components:
src/components/blocks/
├── BlockDetails.tsx     // Individual block page
├── BlockList.tsx        // Paginated block list
├── ExtrinsicDetails.tsx // Transaction details
└── ExtrinsicList.tsx    // Transaction history

// Features to add:
- Block navigation (prev/next)
- Extrinsic filtering
- Real-time block updates
- Block validation status
```

#### 2. **Account Dashboard** (Next 3-4 days)

```typescript
// Create these components:
src/components/accounts/
├── AccountDetails.tsx   // Account overview
├── TransactionHistory.tsx // Account transactions
├── BalanceChart.tsx     // Balance over time
└── StakingInfo.tsx      // Staking details

// Features to add:
- Balance tracking
- Transaction history
- Staking rewards
- Account watchlists
```

#### 3. **Validator Dashboard** (Next 4-5 days)

```typescript
// Create these components:
src/components/validators/
├── ValidatorList.tsx    // All validators
├── ValidatorDetails.tsx // Individual validator
├── StakingStats.tsx     // Network staking stats
└── RewardsChart.tsx     // Rewards visualization

// Features to add:
- Validator performance metrics
- Commission tracking
- Nomination tracking
- Slashing history
```

## 📊 **Data Integration Patterns**

### **Pattern 1: Hybrid Approach (Recommended)**

```typescript
// Use multiple sources for different needs:
const hybridAPI = {
  // Real-time data from RPC
  realTime: new AvailRPC(),
  // Historical data from Subscan
  historical: new SubscanAPI(),
  // Custom analytics from SubQuery
  analytics: new SubQueryAPI(),
}

// Example usage:
const latestBlock = await hybridAPI.realTime.getLatestBlock()
const blockHistory = await hybridAPI.historical.getBlocks(0, 100)
const stakingAnalytics = await hybridAPI.analytics.getStakingTrends()
```

### **Pattern 2: Fallback Strategy**

```typescript
// Implement fallbacks for reliability:
async function getChainData() {
  try {
    return await subscanAPI.getChainData()
  } catch (error) {
    console.warn('Subscan failed, trying RPC...')
    try {
      return await rpcAPI.getChainStats()
    } catch (error2) {
      console.warn('RPC failed, using cached data...')
      return getCachedData()
    }
  }
}
```

## 🏗️ **Architecture Decisions**

### **Why Next.js 14?**

- **App Router**: Better performance, nested layouts
- **Server Components**: Reduced bundle size
- **Streaming**: Progressive loading for better UX
- **Built-in Optimization**: Images, fonts, bundles

### **Why Tailwind CSS?**

- **Rapid Development**: No CSS file management
- **Consistency**: Design system built-in
- **Performance**: Purged unused styles
- **Customization**: Easy theming

### **Why Chart.js over Recharts?**

```typescript
// Chart.js Pros:
✅ More chart types
✅ Better performance
✅ More customization options
✅ Active community

// Recharts Pros:
✅ React-native
✅ Easier React integration
✅ Declarative syntax
```

## 🔧 **Development Workflow**

### **1. Adding New Features**

```bash
# Create feature branch
git checkout -b feature/validator-dashboard

# Create component structure
mkdir src/components/validators
touch src/components/validators/ValidatorList.tsx

# Add to main dashboard
# Test with mock data first
# Integrate with real API
# Add error handling
# Write tests (optional)
```

### **2. API Integration Pattern**

```typescript
// 1. Define types
interface Validator {
  address: string
  commission: number
  stake: string
  // ...
}

// 2. Add to API client
class AvailAPI {
  async getValidators(): Promise<Validator[]> {
    // Implementation
  }
}

// 3. Create React hook
function useValidators() {
  return useQuery(['validators'], () => availAPI.getValidators())
}

// 4. Use in component
function ValidatorList() {
  const { data: validators, isLoading } = useValidators()
  // Render logic
}
```

### **3. Error Handling Strategy**

```typescript
// Global error boundary
function ApiErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error) => console.error('API Error:', error)}
    >
      {children}
    </ErrorBoundary>
  )
}

// Component-level error handling
function useApiCall(apiFunction) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const execute = async () => {
    try {
      setLoading(true)
      const result = await apiFunction()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  return { data, error, loading, execute }
}
```

## 🚦 **Testing Strategy**

### **Unit Testing (Optional but Recommended)**

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

```typescript
// Example test
import { render, screen } from '@testing-library/react'
import { SearchComponent } from '@/components/dashboard/SearchComponent'

test('renders search component', () => {
  render(<SearchComponent />)
  expect(screen.getByPlaceholderText(/search blocks/i)).toBeInTheDocument()
})
```

### **Integration Testing**

```typescript
// Test API integrations
test('fetches chain data from API', async () => {
  const mockAPI = {
    getChainData: jest.fn().mockResolvedValue(mockChainData),
  }

  const { result } = renderHook(() => useChainData(mockAPI))

  await waitFor(() => {
    expect(result.current.data).toEqual(mockChainData)
  })
})
```

## 🎨 **Styling Guidelines**

### **Component Structure**

```typescript
// Follow this pattern:
function MyComponent({ prop1, prop2 }: Props) {
  // 1. Hooks at top
  const [state, setState] = useState()
  const { data } = useQuery()

  // 2. Event handlers
  const handleClick = () => {}

  // 3. Early returns
  if (loading) return <Loading />
  if (error) return <Error />

  // 4. Main render
  return (
    <div className="container mx-auto p-4">
      {/* Content */}
    </div>
  )
}
```

### **Tailwind Patterns**

```typescript
// Use consistent spacing
const spacingClasses = 'p-4 m-2 gap-4'

// Use semantic color names
const colorClasses = 'bg-card text-card-foreground border-border'

// Use responsive design
const responsiveClasses = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
```

## 🔒 **Security Considerations**

### **API Security**

```typescript
// 1. Validate API responses
function validateChainData(data: unknown): ChainData {
  // Use zod or similar for validation
  return chainDataSchema.parse(data)
}

// 2. Rate limiting
const rateLimiter = new Map()
function checkRateLimit(ip: string) {
  // Implement rate limiting logic
}

// 3. Input sanitization
function sanitizeSearchQuery(query: string) {
  return query.replace(/[<>'"]/g, '')
}
```

### **WebSocket Security**

```typescript
// Handle connection errors gracefully
websocket.addEventListener('error', event => {
  console.error('WebSocket error:', event)
  // Implement reconnection logic
})

// Validate incoming messages
websocket.addEventListener('message', event => {
  try {
    const data = JSON.parse(event.data)
    // Validate data structure
  } catch (error) {
    console.error('Invalid message:', error)
  }
})
```

## 🚀 **Deployment Options**

### **Option 1: Vercel (Easiest)**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_BASE_URL=https://api.avail.naxatar.com/api
NEXT_PUBLIC_WS_URL=wss://api.avail.naxatar.com
NEXT_PUBLIC_NODE_ENV=development
```

### **Option 2: Docker + AWS/GCP**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### **Option 3: Static Export**

```javascript
// next.config.js
module.exports = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}
```

## 📈 **Performance Optimization**

### **Code Splitting**

```typescript
// Lazy load heavy components
const ValidatorDashboard = lazy(() => import('./ValidatorDashboard'))

// Use Suspense
<Suspense fallback={<Loading />}>
  <ValidatorDashboard />
</Suspense>
```

### **Data Caching**

```typescript
// React Query with caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})
```

### **Image Optimization**

```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Avail Logo"
  width={200}
  height={100}
  priority // For above-the-fold images
/>
```

## 🤝 **Contributing Guidelines**

### **Code Standards**

1. Use TypeScript for type safety
2. Follow ESLint rules
3. Use Prettier for formatting
4. Write descriptive commit messages
5. Add JSDoc comments for functions

### **Pull Request Process**

1. Create feature branch
2. Write tests if adding functionality
3. Update documentation
4. Request review
5. Merge after approval

---

**Next Steps**: Start with Phase 2 features, beginning with the advanced block explorer. The foundation is solid - now it's time to build the advanced features that make this a world-class blockchain explorer! 🚀
