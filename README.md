# Avail Explorer Dashboard

A modern, responsive dashboard for exploring the Avail blockchain network.

<!-- Pre-commit hooks test: ESLint and formatting enabled -->

## Features

- Real-time blockchain data visualization
- Account and transaction exploration
- Block details and extrinsic inspection
- Responsive design with dark/light mode support
- API integration with fallback support

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Charts**: Chart.js, Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd avail-explorer-dashboard
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run type-check` - Run TypeScript checks

## Environment Configuration

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.avail.naxatar.com/api
NEXT_PUBLIC_WS_URL=wss://api.avail.naxatar.com
NEXT_PUBLIC_NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

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
   # API Configuration
   NEXT_PUBLIC_API_BASE_URL=https://api.avail.naxatar.com/api
   NEXT_PUBLIC_WS_URL=wss://api.avail.naxatar.com
   NEXT_PUBLIC_NODE_ENV=development
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

The dashboard displays key metrics:

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

## 🚀 Deployment

### Production Deployment with Docker Compose (Recommended)

1. **Set up environment variables**
   
   Copy the production environment template:
   ```bash
   cp env.production.template .env.production
   ```
   
   Edit `.env.production` with your configuration:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_BASE_URL=https://api.avail.naxatar.com/api
   NEXT_PUBLIC_WS_URL=wss://api.avail.naxatar.com
   NEXT_PUBLIC_NODE_ENV=production

   # Application Configuration  
   NODE_ENV=production
   PORT=3000
   HOSTNAME=0.0.0.0
   NEXT_TELEMETRY_DISABLED=1

   # Docker Configuration
   FRONTEND_PORT=3000
   ```

2. **Deploy the frontend**
   
   ```bash
   # Deploy with environment variables
   NEXT_PUBLIC_API_BASE_URL=https://api.avail.naxatar.com/api \
   NEXT_PUBLIC_WS_URL=wss://api.avail.naxatar.com \
   NEXT_PUBLIC_NODE_ENV=production \
   docker-compose up -d frontend
   ```

3. **Verify deployment**
   
   ```bash
   # Check container status
   docker ps
   
   # Check logs
   docker logs avail-frontend
   
   # Test health endpoint
   curl http://localhost:3000/api/health
   
   # Test main page
   curl http://localhost:3000/
   ```


#### Docker (Manual Build)

```bash
# Build the image
docker build -t avail-explorer .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=https://api.avail.naxatar.com/api \
  -e NEXT_PUBLIC_WS_URL=wss://api.avail.naxatar.com \
  -e NEXT_PUBLIC_NODE_ENV=production \
  avail-explorer
```

#### Manual Build (Without Docker)

```bash
# Install dependencies
npm ci --only=production

# Build the application
npm run build

# Start the production server
npm start
```

### Production Checklist

- [ ] Environment variables configured in `.env.production`
- [ ] Docker container running successfully
- [ ] Health endpoint responding (503 is acceptable if backend is unavailable)
- [ ] Frontend serving content on port 3000
- [ ] NGINX proxy configured (if using custom domain)
- [ ] SSL certificates configured (if using HTTPS)

### Monitoring

```bash
# Monitor container health
docker ps
docker logs avail-frontend --follow

# Check resource usage
docker stats avail-frontend

# Restart if needed
docker-compose restart frontend
```

## 🔗 API Integration

### Connecting to Avail Network

```typescript
// Example: Using the unified API endpoint
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.avail.naxatar.com/api'

// Fetch chain statistics
const chainStats = await fetch(`${API_BASE_URL}/chain/stats`)
const data = await chainStats.json()
```

### Using WebSocket Connection

```typescript
// Example: WebSocket connection for real-time updates
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.avail.naxatar.com'
const ws = new WebSocket(WS_URL)
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
