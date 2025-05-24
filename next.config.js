/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  env: {
    AVAIL_RPC_ENDPOINT: process.env.AVAIL_RPC_ENDPOINT || 'wss://mainnet-rpc.avail.so/ws',
    AVAIL_API_ENDPOINT: process.env.AVAIL_API_ENDPOINT || 'https://avail.api.subscan.io',
  },
}

module.exports = nextConfig 