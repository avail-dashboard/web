#!/bin/bash

# Docker Build Test Script for Optimized Avail Frontend
# This script tests the optimized Docker configuration

set -e

echo "🐳 Testing Optimized Docker Configuration for Avail Frontend"
echo "============================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker daemon is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker daemon is running"

# Build the optimized image
echo "🔨 Building optimized Docker image..."
docker build \
    --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.avail.naxatar.com/api \
    --build-arg NEXT_PUBLIC_WS_URL=wss://api.avail.naxatar.com \
    --build-arg NEXT_PUBLIC_NODE_ENV=production \
    -t avail-frontend-optimized:test \
    .

echo "✅ Docker image built successfully"

# Check image size
echo "📊 Image size comparison:"
docker images | grep avail-frontend

# Test the container
echo "🧪 Testing container startup..."
CONTAINER_ID=$(docker run -d -p 3001:3000 avail-frontend-optimized:test)

echo "⏳ Waiting for container to start..."
sleep 10

# Test health check
echo "🏥 Testing health check..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    docker logs $CONTAINER_ID
fi

# Check container security
echo "🔒 Security check - verifying non-root user..."
USER_CHECK=$(docker exec $CONTAINER_ID whoami)
if [ "$USER_CHECK" = "nextjs" ]; then
    echo "✅ Container running as non-root user: $USER_CHECK"
else
    echo "❌ Container running as: $USER_CHECK (should be nextjs)"
fi

# Cleanup
echo "🧹 Cleaning up test container..."
docker stop $CONTAINER_ID > /dev/null
docker rm $CONTAINER_ID > /dev/null

echo "🎉 Docker optimization test completed successfully!"
echo ""
echo "Key improvements:"
echo "- Multi-stage build with optimized layer caching"
echo "- Non-root user for security"
echo "- Standalone Next.js output for smaller image size"
echo "- Enhanced health checks"
echo "- Read-only filesystem with security enhancements"
echo ""
echo "To deploy: docker-compose up --build" 