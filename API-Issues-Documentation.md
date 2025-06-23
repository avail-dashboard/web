# API Issues Documentation

## Missing Data from Backend Endpoints

### Focus Areas

This document identifies missing data from backend APIs specifically for:

1. **Homepage endpoints** (chain stats, latest blocks, data submission stats)
2. **Search endpoints** (universal search functionality)
3. **Data submission endpoints** (list, stats, individual submissions)

---

## 1. Homepage - Missing Data Issues

### 1.1 Chain Statistics API (`/api/chain/stats`)

**Current Frontend Expectations** (from `src/app/page.tsx`):

```typescript
interface ChainStats {
  finalizedBlocks: number
  signedExtrinsics: number
  stakedAmount: string
  bondedAmount: string
  holders: number
  totalAccounts: number
  transfers: number
  inflationRate: number
  tokenPrice: number // MISSING
  priceChange: number // MISSING
  totalIssuance: string
  circulating: { amount: string; percentage: number }
  staking: { amount: string; percentage: number }
  treasury: { amount: string; percentage: number }
  others: { amount: string; percentage: number }
  marketCap: number // MISSING
  totalSupply: number // MISSING
  circulatingSupply: number // MISSING
  stakingRatio: number // MISSING
  inflation: number // MISSING
  activeValidators: number // MISSING
  blockTime: number // MISSING
  lastBlockTimestamp: number // MISSING
}
```

**Issues Found:**

1. **Token Price Data**: Homepage shows `AVAIL $0.00000000` - backend doesn't provide `tokenPrice` or `priceChange`
2. **Market Metrics**: Missing `marketCap`, `totalSupply`, `circulatingSupply`
3. **Network Health**: Missing `activeValidators`, `blockTime`, `lastBlockTimestamp`
4. **Staking Metrics**: Missing `stakingRatio`

### 1.2 Data Submission Stats for Homepage

**Current Frontend Usage** (from `src/app/page.tsx` lines 152-162):

```typescript
// Data Submissions card shows "Loading..." for:
stats={[
  {
    label: "Data Submissions",
    value: "Loading..."  // Should show total count
  },
  {
    label: "Unique Apps",
    value: "Loading..."  // Should show unique app count
  }
]}
```

**Missing Endpoint:**

- No quick stats endpoint for homepage data submission summary
- Need: `/api/data-submissions/stats/summary` returning:
  ```json
  {
    "totalSubmissions": 50000,
    "uniqueApps": 25,
    "totalDataSize": "1.2 GB",
    "submissions24h": 1200
  }
  ```

---

## 2. Search - Missing Data Issues

### 2.1 Search Response Format (`/api/search`)

**Current Frontend Expectations** (from `src/components/search/GlobalSearch.tsx`):

```typescript
interface SearchResult {
  blocks: Block[]
  extrinsics: Extrinsic[]
  accounts: Account[]
  validators: Validator[]
  rollups?: Rollup[] // MISSING from search
}
```

**Issues Found:**

1. **Search returns empty array** - Backend search endpoint not functional
2. **Missing rollups/apps in search** - Should be able to search for data submission apps
3. **No fuzzy matching** - Backend should support partial matches
4. **Missing metadata** - No search relevance scores or match highlighting

**Expected Response Format:**

```json
{
  "success": true,
  "data": {
    "query": "search_term",
    "results": {
      "blocks": [
        {
          "number": 1234567,
          "hash": "0x...",
          "timestamp": "2024-01-01T12:00:00Z",
          "extrinsicsCount": 15,
          "matchField": "number",
          "relevanceScore": 1.0
        }
      ],
      "extrinsics": [...],
      "accounts": [...],
      "validators": [...],
      "rollups": [...]  // MISSING
    },
    "totalResults": 25,
    "searchTime": 45
  }
}
```

---

## 3. Data Submissions - Missing Data Issues

### 3.1 Data Submissions List (`/api/data-submissions`)

**Current Frontend Usage** (from `src/app/data-submissions/page.tsx`):

```typescript
// Expected response format
interface DataSubmissionResponse {
  dataSubmissions: DataSubmission[]
  totalCount: number
}

interface DataSubmission {
  blockNumber: number
  extrinsicIndex: number
  extrinsicHash: string
  appId: number
  submitter: string
  dataSize: number
  dataHash: string
  kateCommitment?: string // MISSING
  timestamp: string
  success: boolean
  rollupName?: string // MISSING - requires app registry
}
```

**Issues Found:**

1. **Missing App/Rollup Names** - Only returns `appId`, no human-readable names
2. **Missing KZG Commitments** - No `kateCommitment` field
3. **No App Registry** - Can't resolve `appId` to rollup information
4. **Limited Filtering** - Missing filters for data size ranges, date ranges

### 3.2 Data Submissions Stats (`/api/data-submissions/stats`)

**Current Frontend Usage** (from `src/app/data-submissions/page.tsx` lines 42-48):

```typescript
interface DataSubmissionStats {
  totalSubmissions: number
  totalDataSize: number
  uniqueApps: number
  uniqueSubmitters: number
  averageSize: number
  submissionsToday: number // MISSING
  dataSizeToday: number // MISSING
}
```

**Issues Found:**

1. **Missing Time-based Stats** - No today/24h/7d breakdowns
2. **No Growth Metrics** - Missing period-over-period comparisons
3. **No Size Distribution** - Missing data size histogram/percentiles

---

## 4. Testing Options

### Option 1: Manual API Testing Checklist

#### Homepage APIs

- [ ] Test `/api/chain/stats` for missing price data
- [ ] Verify data submission stats integration
- [ ] Check latest blocks data completeness

#### Search APIs

- [ ] Test search with block numbers
- [ ] Test search with addresses
- [ ] Test search with transaction hashes
- [ ] Verify empty results handling

#### Data Submission APIs

- [ ] Test pagination functionality
- [ ] Verify filtering by appId and submitter
- [ ] Check stats endpoint completeness

### Option 2: Playwright MCP Automated Testing

```typescript
// Playwright test example for API validation
test('Homepage APIs return required data', async ({ page }) => {
  // Navigate to homepage
  await page.goto('/')

  // Wait for data to load
  await page.waitForSelector('[data-testid="chain-stats"]')

  // Check for missing price data
  const priceElement = page.locator('[data-testid="token-price"]')
  await expect(priceElement).not.toContainText('$0.00000000')

  // Check data submission stats
  const submissionStats = page.locator('[data-testid="submission-stats"]')
  await expect(submissionStats).not.toContainText('Loading...')
})
```

---

## 5. Priority Issues for Backend Team

### High Priority (Blocking Homepage)

1. **Token price integration** - Homepage shows $0.00 price
2. **Data submission stats summary** - Cards show "Loading..."
3. **Search functionality** - Currently returns empty results

### Medium Priority (Enhancing UX)

1. **App/Rollup name resolution** - Show names instead of just IDs
2. **Time-based statistics** - 24h, 7d, 30d breakdowns
3. **Advanced search features** - Rollup search, fuzzy matching

### Low Priority (Nice to Have)

1. **Market data integration** - Market cap, supply metrics
2. **Performance metrics** - Search timing, response caching
3. **Data export functionality** - CSV/JSON downloads

---

## 6. Recommended Backend Changes

### 6.1 New Endpoints Needed

```
GET /api/chain/market-data     - Token price, market cap, etc.
GET /api/rollups/registry      - App ID to name mapping
GET /api/search/suggestions    - Autocomplete functionality
GET /api/analytics/summary     - Homepage dashboard metrics
```

### 6.2 Enhanced Existing Endpoints

```
GET /api/data-submissions      - Add rollup names, more filters
GET /api/search               - Add rollup results, relevance scores
GET /api/chain/stats          - Add missing network health metrics
```

### 6.3 Response Format Standardization

All endpoints should follow consistent format:

```json
{
  "success": boolean,
  "data": object|array,
  "meta": {
    "source": "rpc|database|cache",
    "timestamp": "ISO 8601",
    "page": number,
    "limit": number,
    "total": number
  },
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```
