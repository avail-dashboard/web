// Validate required environment variables at build time
if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  console.error('❌ Missing required environment variable: NEXT_PUBLIC_API_BASE_URL')
  process.exit(1)
}
if (!process.env.NEXT_PUBLIC_WS_URL) {
  console.error('❌ Missing required environment variable: NEXT_PUBLIC_WS_URL')
  process.exit(1)
}
if (!process.env.NODE_ENV) {
  console.error('❌ Missing required environment variable: NODE_ENV')
  process.exit(1)
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker optimization
  output: 'standalone',

  // Enable source maps for development mode
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Enable high-quality source maps for client-side development
      config.devtool = 'eval-source-map'
    }
    return config
  },

  // Additional development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    // Disable webpack bundling optimization in dev for better source maps
    swcMinify: false,
  }),

  images: {
    domains: ['localhost'],
  },
  env: {
    // Backend API Configuration - No fallbacks, validation ensures these exist
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV || process.env.NODE_ENV,
  },
}

module.exports = nextConfig
