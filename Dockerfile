# Multi-stage build for Avail Explorer Web Frontend

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create public directory if not exists
RUN mkdir -p ./public

# Set environment variables for the build
ENV NEXT_PUBLIC_API_BASE_URL=https://api.avail.naxatar.com/api/v1
ENV NEXT_PUBLIC_WS_URL=wss://api.avail.naxatar.com
ENV NEXT_PUBLIC_NODE_ENV=production
ENV AVAIL_RPC_ENDPOINT=wss://mainnet-rpc.avail.so/ws
ENV AVAIL_API_ENDPOINT=https://avail.api.subscan.io

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set NODE_ENV
ENV NODE_ENV=production

# Create public directory
RUN mkdir -p ./public

# Copy built application
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./

# Install only production dependencies, explicitly skipping the prepare script
RUN npm pkg delete scripts.prepare && \
    npm install --omit=dev && \
    npm cache clean --force

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"] 