# Web Frontend Deployment Status

## Overview

The Avail Explorer web frontend has been successfully deployed as a Docker container and is accessible at `https://avail.naxatar.com`. The frontend communicates with the backend API at `https://api.avail.naxatar.com`.

**Last Deployment**: May 31, 2025 07:54 UTC ✅

## Components Deployed

### Web Frontend

- **Status**: ✅ Running
- **Docker Container**: `avail-frontend`
- **Port**: 3000
- **Domain**: https://avail.naxatar.com
- **Image**: Custom Next.js application
- **Container ID**: a5dce21e8f6f
- **Health Status**: Degraded (expected - backend API unreachable)

## Recent Deployment Notes

### May 31, 2025 Deployment
- **Issue Resolved**: Fixed husky script execution during Docker build by adding `--ignore-scripts` flag
- **Build Status**: ✅ Successful
- **Environment Variables**: Properly configured with production API endpoints
- **Application Status**: Frontend serving correctly, showing fallback behavior when backend is unavailable
- **Health Endpoint**: Returns 503 (degraded) due to backend API being unreachable, which is expected behavior

## Configuration

### Environment Variables

- `NEXT_PUBLIC_API_BASE_URL`: https://api.avail.naxatar.com/api
- `NEXT_PUBLIC_WS_URL`: wss://api.avail.naxatar.com
- `NEXT_PUBLIC_NODE_ENV`: production

### NGINX Configuration

NGINX is configured to serve the web frontend over HTTPS at `avail.naxatar.com` by proxying requests to the Docker container running on port 3000. SSL certificates are managed by Let's Encrypt and auto-renew.

## HTTPS Setup

- SSL certificates are provided by Let's Encrypt
- Both frontend and backend domains have HTTPS enabled
- HTTP traffic is automatically redirected to HTTPS
- Certificates will auto-renew via Certbot's cron job

## CORS Handling

CORS issues are prevented by:

1. Both frontend and backend are served from the same parent domain (`naxatar.com`)
2. Both services use HTTPS for secure communications
3. Proper NGINX proxy headers are set to maintain WebSocket connections
4. Backend API is configured to accept requests from the frontend domain

## Deployment Files

- `Dockerfile`: Multi-stage build for the Next.js application (updated with --ignore-scripts)
- `docker-compose.yml`: Container orchestration
- `setup-web-nginx.sh`: NGINX configuration script
- `web-avail.conf`: NGINX site configuration

## Troubleshooting Notes

- **Husky Issue**: Resolved by adding `--ignore-scripts` flag to npm ci commands in Dockerfile
- During the build process, there were warnings about chain stats and data submission API errors. These are expected when the backend is not fully operational during the build.
- The frontend application is built with fallback capabilities to use Next.js API routes when the backend is unavailable.
- The frontend successfully connects to Subscan API for chain statistics when the backend is unavailable.
- Health endpoint correctly reports "degraded" status when backend is unreachable

## Next Steps

1. ✅ Frontend deployment completed successfully
2. Monitor the health of the frontend container using `docker ps` and the built-in healthcheck
3. Ensure the backend is stable and providing data to the frontend
4. Set up monitoring and logging for the frontend application

## Future Deployment Prevention Guide

To avoid similar issues in future deployments:

1. **Husky Scripts**: Always use `--ignore-scripts` flag during production Docker builds to skip development-only scripts
2. **Environment Variables**: Ensure all required environment variables are properly set before deployment
3. **Health Checks**: The 503 status from health endpoint is expected when backend is unavailable - this is correct behavior
4. **Build Warnings**: API connection warnings during build are expected and don't indicate deployment failure
