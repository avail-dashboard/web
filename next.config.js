/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  env: {
    // Backend API Configuration
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
    NEXT_PUBLIC_NODE_ENV:
      process.env.NEXT_PUBLIC_NODE_ENV || process.env.NODE_ENV || 'development',
    AVAIL_RPC_ENDPOINT:
      process.env.AVAIL_RPC_ENDPOINT || 'wss://mainnet-rpc.avail.so/ws',
    AVAIL_API_ENDPOINT:
      process.env.AVAIL_API_ENDPOINT || 'https://avail.api.subscan.io',
  },
}

module.exports = nextConfig
