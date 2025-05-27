# Avail Explorer Dashboard - Project Architecture

## Overview

This document contains the mermaid diagrams explaining the architecture of the Avail Explorer Dashboard project.

## Main Architecture Diagram

```mermaid
graph TB
    %% External Data Sources
    subgraph "External Data Sources"
        AVAIL[Avail Mainnet RPC<br/>wss://mainnet-rpc.avail.so/ws]
        SUBSCAN[Subscan API<br/>avail.api.subscan.io]
        PRICE[Price APIs<br/>CoinGecko/CoinMarketCap]
    end

    %% Backend Services
    subgraph "Backend Services"
        BACKEND[Backend API Server<br/>localhost:3001]
        WS[WebSocket Server<br/>Real-time updates]
        INDEXER[SubQuery Indexer<br/>Optional]
    end

    %% Frontend Application
    subgraph "Frontend Application (Next.js 14)"
        subgraph "App Router"
            HOME[Dashboard Page<br/>src/app/page.tsx]
            BLOCKS_PAGE[Blocks Explorer<br/>src/app/blocks/]
            EXTRINSICS_PAGE[Extrinsics Explorer<br/>src/app/extrinsics/]
            ACCOUNTS_PAGE[Accounts Explorer<br/>src/app/accounts/]
            API_ROUTES[API Routes<br/>src/app/api/]
        end

        subgraph "Components Layer"
            DASHBOARD_COMP[Dashboard Components<br/>src/components/dashboard/]
            CHARTS[Chart Components<br/>src/components/charts/]
            UI[UI Components<br/>src/components/ui/]
            BLOCKS_COMP[Block Components<br/>src/components/blocks/]
            TRANSFERS[Transfer Components<br/>src/components/transfers/]
        end

        subgraph "Data Layer"
            API_CLIENT[API Client<br/>src/lib/api.ts]
            HOOKS[Custom Hooks<br/>src/lib/hooks/]
            UTILS[Utilities<br/>src/lib/utils.ts]
        end

        subgraph "State Management"
            ZUSTAND[Zustand Stores<br/>Global State]
            REACT_QUERY[React Query<br/>Data Caching & Sync]
        end
    end

    %% Styling & UI
    subgraph "Styling & UI Framework"
        TAILWIND[Tailwind CSS<br/>Styling]
        SHADCN[shadcn/ui<br/>Component Library]
        LUCIDE[Lucide React<br/>Icons]
        RECHARTS[Recharts<br/>Data Visualization]
    end

    %% Development Tools
    subgraph "Development & Quality Tools"
        TYPESCRIPT[TypeScript<br/>Type Safety]
        ESLINT[ESLint<br/>Code Linting]
        PRETTIER[Prettier<br/>Code Formatting]
        JEST[Jest<br/>Unit Testing]
        PLAYWRIGHT[Playwright<br/>E2E Testing]
        HUSKY[Husky<br/>Git Hooks]
    end

    %% Deployment
    subgraph "Deployment Options"
        VERCEL[Vercel<br/>Recommended]
        DOCKER[Docker<br/>Containerized]
        MANUAL[Manual Build<br/>npm run build]
    end

    %% Data Flow Connections
    AVAIL --> BACKEND
    SUBSCAN --> BACKEND
    PRICE --> BACKEND
    INDEXER --> BACKEND

    BACKEND --> API_CLIENT
    WS --> API_CLIENT

    API_CLIENT --> HOOKS
    HOOKS --> REACT_QUERY
    REACT_QUERY --> DASHBOARD_COMP
    REACT_QUERY --> CHARTS
    REACT_QUERY --> BLOCKS_COMP

    ZUSTAND --> DASHBOARD_COMP
    UTILS --> HOOKS

    HOME --> DASHBOARD_COMP
    HOME --> CHARTS
    BLOCKS_PAGE --> BLOCKS_COMP
    EXTRINSICS_PAGE --> TRANSFERS

    DASHBOARD_COMP --> UI
    CHARTS --> RECHARTS
    UI --> SHADCN
    UI --> LUCIDE

    TAILWIND --> HOME
    TYPESCRIPT --> API_CLIENT

    %% Styling
    classDef external fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef frontend fill:#e8f5e8
    classDef tools fill:#fff3e0
    classDef deployment fill:#fce4ec

    class AVAIL,SUBSCAN,PRICE,INDEXER external
    class BACKEND,WS backend
    class HOME,BLOCKS_PAGE,EXTRINSICS_PAGE,ACCOUNTS_PAGE,API_ROUTES,DASHBOARD_COMP,CHARTS,UI,BLOCKS_COMP,TRANSFERS,API_CLIENT,HOOKS,UTILS,ZUSTAND,REACT_QUERY frontend
    class TYPESCRIPT,ESLINT,PRETTIER,JEST,PLAYWRIGHT,HUSKY,TAILWIND,SHADCN,LUCIDE,RECHARTS tools
    class VERCEL,DOCKER,MANUAL deployment
```

## Component Hierarchy Diagram

```mermaid
graph TD
    subgraph "Page Level"
        DASHBOARD[Dashboard Page<br/>src/app/page.tsx]
        LAYOUT[Root Layout<br/>src/app/layout.tsx]
    end

    subgraph "Dashboard Components"
        SEARCH[SearchComponent<br/>Block/Tx/Account Search]
        STATS[Chain Statistics Cards<br/>Blocks, Extrinsics, Staking]
        EXPLORER_NAV[Explorer Navigation<br/>Links to Blocks/Extrinsics/Accounts]
        LATEST_BLOCKS[Latest Blocks Section<br/>Real-time Block Data]
        TOKEN_DIST[Token Distribution Chart<br/>Pie Chart Visualization]
        BLOCKS_CHART[Blocks Chart<br/>Historical Block Data]
        TRANSFERS_TABLE[Transfers Table<br/>Recent Transactions]
    end

    subgraph "Shared Components"
        STATUS[Backend Status<br/>Connection Indicator]
        MONITOR[API Call Monitor<br/>Debug Component]
        TOOLBAR[Stagewise Toolbar<br/>Development Tool]
    end

    subgraph "UI Components (shadcn/ui)"
        BUTTON[Button]
        CARD[Card]
        BADGE[Badge]
        TABLE[Table]
        TABS[Tabs]
        SELECT[Select]
        AVATAR[Avatar]
        DROPDOWN[Dropdown Menu]
    end

    LAYOUT --> DASHBOARD
    DASHBOARD --> SEARCH
    DASHBOARD --> STATS
    DASHBOARD --> EXPLORER_NAV
    DASHBOARD --> LATEST_BLOCKS
    DASHBOARD --> TOKEN_DIST
    DASHBOARD --> BLOCKS_CHART
    DASHBOARD --> TRANSFERS_TABLE
    DASHBOARD --> STATUS
    DASHBOARD --> MONITOR

    SEARCH --> BUTTON
    SEARCH --> SELECT
    STATS --> CARD
    STATS --> BADGE
    LATEST_BLOCKS --> TABLE
    LATEST_BLOCKS --> CARD
    TOKEN_DIST --> CARD
    BLOCKS_CHART --> CARD
    TRANSFERS_TABLE --> TABLE
    STATUS --> BADGE
    EXPLORER_NAV --> CARD

    classDef page fill:#e3f2fd
    classDef dashboard fill:#e8f5e8
    classDef shared fill:#fff3e0
    classDef ui fill:#f3e5f5

    class DASHBOARD,LAYOUT page
    class SEARCH,STATS,EXPLORER_NAV,LATEST_BLOCKS,TOKEN_DIST,BLOCKS_CHART,TRANSFERS_TABLE dashboard
    class STATUS,MONITOR,TOOLBAR shared
    class BUTTON,CARD,BADGE,TABLE,TABS,SELECT,AVATAR,DROPDOWN ui
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Dashboard
    participant Hooks
    participant API_Client
    participant Backend
    participant Avail_RPC
    participant Subscan

    User->>Dashboard: Loads page
    Dashboard->>Hooks: useChainData()
    Dashboard->>Hooks: useBlocks()

    Hooks->>API_Client: getChainData()
    Hooks->>API_Client: getLatestBlocks()

    API_Client->>Backend: Health check

    alt Backend Available
        Backend->>Avail_RPC: Fetch chain data
        Backend->>Subscan: Fetch indexed data
        Avail_RPC-->>Backend: Chain statistics
        Subscan-->>Backend: Block data
        Backend-->>API_Client: Aggregated data
    else Backend Unavailable
        API_Client->>API_Client: Use fallback data
        Note over API_Client: Mock/cached data
    end

    API_Client-->>Hooks: Return data
    Hooks-->>Dashboard: Update state
    Dashboard-->>User: Render dashboard

    Note over Dashboard: Auto-refresh every 15-60s

    User->>Dashboard: Click refresh
    Dashboard->>Hooks: refetch()
    Hooks->>API_Client: Re-fetch data
    API_Client-->>Dashboard: Updated data
```

## Technology Stack Overview

```mermaid
mindmap
  root((Avail Explorer Dashboard))
    Frontend
      Next.js 14
        App Router
        Server Components
        API Routes
      React 18
        Hooks
        Context
        Suspense
      TypeScript
        Type Safety
        Interfaces
        Generics
    Styling
      Tailwind CSS
        Utility Classes
        Custom Theme
        Responsive Design
      shadcn/ui
        Component Library
        Accessible Components
        Customizable
      Lucide React
        Icon Library
        Consistent Icons
    Data Management
      React Query
        Caching
        Background Updates
        Error Handling
      Zustand
        Global State
        Simple API
        TypeScript Support
      Axios
        HTTP Client
        Interceptors
        Error Handling
    Visualization
      Recharts
        Charts Library
        React Integration
        Responsive Charts
      Chart.js
        Alternative Charts
        Canvas Based
    Backend Integration
      Polkadot API
        Blockchain RPC
        WebSocket
        Type Definitions
      Subscan API
        Indexed Data
        REST API
        Historical Data
    Development
      ESLint
        Code Quality
        Custom Rules
        TypeScript Support
      Prettier
        Code Formatting
        Consistent Style
      Jest
        Unit Testing
        Mocking
        Coverage
      Playwright
        E2E Testing
        Cross Browser
        Visual Testing
      Husky
        Git Hooks
        Pre-commit
        Quality Gates
```

## Deployment Architecture

```mermaid
graph LR
    subgraph "Development"
        DEV[Local Development<br/>npm run dev<br/>localhost:3000]
        BACKEND_DEV[Backend Server<br/>localhost:3001]
    end

    subgraph "CI/CD Pipeline"
        GIT[Git Repository]
        ACTIONS[GitHub Actions<br/>- Lint & Test<br/>- Build<br/>- Deploy]
        QUALITY[Quality Gates<br/>- ESLint<br/>- Prettier<br/>- Jest<br/>- Playwright]
    end

    subgraph "Production Deployment"
        VERCEL_PROD[Vercel Production<br/>- Auto Deploy<br/>- CDN<br/>- Edge Functions]
        DOCKER_PROD[Docker Container<br/>- Self Hosted<br/>- Scalable<br/>- Portable]
        STATIC[Static Export<br/>- CDN Deploy<br/>- S3/Netlify<br/>- Fast Loading]
    end

    subgraph "External Services"
        AVAIL_NET[Avail Mainnet<br/>wss://mainnet-rpc.avail.so]
        SUBSCAN_API[Subscan API<br/>avail.api.subscan.io]
        PRICE_API[Price APIs<br/>Market Data]
    end

    DEV --> GIT
    GIT --> ACTIONS
    ACTIONS --> QUALITY
    QUALITY --> VERCEL_PROD
    QUALITY --> DOCKER_PROD
    QUALITY --> STATIC

    VERCEL_PROD --> AVAIL_NET
    VERCEL_PROD --> SUBSCAN_API
    VERCEL_PROD --> PRICE_API

    DOCKER_PROD --> AVAIL_NET
    DOCKER_PROD --> SUBSCAN_API
    DOCKER_PROD --> PRICE_API

    classDef dev fill:#e3f2fd
    classDef cicd fill:#e8f5e8
    classDef prod fill:#fff3e0
    classDef external fill:#fce4ec

    class DEV,BACKEND_DEV dev
    class GIT,ACTIONS,QUALITY cicd
    class VERCEL_PROD,DOCKER_PROD,STATIC prod
    class AVAIL_NET,SUBSCAN_API,PRICE_API external
```

## Key Features & Capabilities

### 🚀 Core Features

- **Real-time Chain Data**: Live blockchain statistics and metrics
- **Block Explorer**: Browse and search blockchain blocks
- **Transaction Explorer**: View extrinsics and transaction details
- **Account Explorer**: Account information and transaction history
- **Token Analytics**: Price tracking and distribution visualization
- **Search Functionality**: Universal search for blocks, transactions, and accounts

### 🏗️ Architecture Highlights

- **Hybrid Data Strategy**: Backend + fallback frontend API calls
- **Real-time Updates**: WebSocket integration for live data
- **Performance Optimized**: React Query caching and background updates
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Quality Assurance**: Comprehensive testing and code quality tools

### 🔧 Development Features

- **Hot Reloading**: Fast development with Next.js
- **Code Quality**: ESLint, Prettier, and pre-commit hooks
- **Testing**: Unit tests (Jest) and E2E tests (Playwright)
- **Documentation**: Comprehensive guides and API documentation
- **Monitoring**: API call monitoring and backend status tracking

### 🚀 Deployment Options

- **Vercel**: Recommended for easy deployment and scaling
- **Docker**: Containerized deployment for any environment
- **Static Export**: For CDN deployment and maximum performance
