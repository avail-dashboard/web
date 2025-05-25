# Avail Explorer Dashboard

A modern blockchain explorer dashboard for the Avail network, inspired by [avail.subscan.io](https://avail.subscan.io). Built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Real-time Chain Data**: Display finalized blocks, extrinsics, staking info
- **Token Analytics**: Price tracking, distribution charts, market metrics
- **Block Explorer**: Latest blocks with transaction details
- **Responsive Design**: Modern UI with dark/light mode support
- **Performance Optimized**: Fast loading with efficient data fetching

## 🏗️ Architecture Overview

### Frontend Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **State Management**: Zustand + React Query
- **Icons**: Lucide React

### Backend Integration

- **Blockchain RPC**: Avail mainnet RPC endpoint
- **API Layer**: Subscan API integration
- **Data Indexing**: Compatible with SubQuery indexer

## 📋 Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Git

## 🛠️ Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd avail-explorer-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env.local` file:

   ```env
   # Avail Network Configuration
   AVAIL_RPC_ENDPOINT=wss://mainnet-rpc.avail.so/ws
   AVAIL_API_ENDPOINT=https://avail.api.subscan.io

   # Optional: Add API keys if needed
   # SUBSCAN_API_KEY=your_api_key_here
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard home page
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── charts/           # Chart components
│   └── dashboard/        # Dashboard-specific components
├── lib/                  # Utility functions
│   ├── utils.ts          # Common utilities
│   ├── api.ts            # API integration
│   └── types.ts          # TypeScript types
├── hooks/                # Custom React hooks
└── stores/               # Zustand stores
```

## 🔧 Building Similar Dashboard Features

### 1. Chain Statistics Cards

The dashboard displays key metrics like avail.subscan.io:

- Finalized blocks count
- Signed extrinsics
- Staking/bonding amounts
- Account holders
- Transfer counts
- Inflation rate

### 2. Token Distribution Chart

Visual representation of token allocation:

- Circulating supply
- Staking rewards
- Treasury funds
- Other allocations

### 3. Latest Blocks Section

Real-time block information:

- Block numbers and hashes
- Timestamp and age
- Extrinsic counts
- Block navigation

### 4. Network Status

Live network monitoring:

- Connection status
- Network selection (mainnet/testnet)
- Current token price
- Price change indicators

## 🚀 Deployment Options

### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

### Docker

```bash
docker build -t avail-explorer .
docker run -p 3000:3000 avail-explorer
```

### Manual Build

```bash
npm run build
npm start
```

## 🔗 API Integration

### Connecting to Avail Network

```typescript
// Example: Connecting to Avail RPC
import { ApiPromise, WsProvider } from '@polkadot/api'

const provider = new WsProvider('wss://mainnet-rpc.avail.so/ws')
const api = await ApiPromise.create({ provider })
```

### Using Subscan API

```typescript
// Example: Fetching block data
const response = await fetch('https://avail.api.subscan.io/api/scan/blocks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ row: 10, page: 0 }),
})
```

## 📊 Advanced Features to Add

### Phase 2 Enhancements

- **Search Functionality**: Block/transaction/address search
- **Account Details**: Individual account pages with transaction history
- **Validator Dashboard**: Staking validator information
- **Governance Section**: Proposal tracking and voting
- **Analytics Charts**: Historical data visualization
- **WebSocket Integration**: Real-time updates
- **Mobile App**: React Native version

### Data Sources

- **Primary**: Avail RPC endpoints
- **Secondary**: Subscan API for indexed data
- **Custom**: SubQuery indexer for complex queries
- **Price Data**: CoinGecko/CoinMarketCap APIs

## 🎨 Customization

### Themes

Modify colors in `tailwind.config.js`:

```javascript
colors: {
  avail: {
    50: '#f0f9ff',
    500: '#0ea5e9',
    600: '#0284c7',
  }
}
```

### Components

Add new dashboard sections by creating components in `src/components/dashboard/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Related Resources

- [Avail Documentation](https://docs.availproject.org/)
- [Subscan API Docs](https://docs.api.subscan.io/)
- [Polkadot.js API](https://polkadot.js.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📞 Support

For questions and support:

- Open an issue on GitHub
- Join the Avail Discord community
- Check the documentation

---

**Note**: This is a community project and not officially maintained by the Avail team. For production use, ensure proper security audits and testing.

# Pre-commit Setup Complete
