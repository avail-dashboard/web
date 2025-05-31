# Web Frontend Deployment Status

## Overview

The Avail Explorer web frontend has been successfully deployed as a Docker container and is accessible at `https://avail.naxatar.com`. The frontend communicates with the backend API at `https://api.avail.naxatar.com`.

## Components Deployed

### Web Frontend

- **Status**: ✅ Running
- **Docker Container**: `avail-frontend`
- **Port**: 3000
- **Domain**: https://avail.naxatar.com
- **Image**: Custom Next.js application

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

- `Dockerfile`: Multi-stage build for the Next.js application
- `docker-compose.yml`: Container orchestration
- `setup-web-nginx.sh`: NGINX configuration script
- `web-avail.conf`: NGINX site configuration

## Troubleshooting Notes

- During the build process, there were warnings about chain stats and data submission API errors. These are expected when the backend is not fully operational during the build.
- The frontend application is built with fallback capabilities to use Next.js API routes when the backend is unavailable.
- The frontend successfully connects to Subscan API for chain statistics when the backend is unavailable.

## Next Steps

1. Monitor the health of the frontend container using `docker ps` and the built-in healthcheck
2. Ensure the backend is stable and providing data to the frontend
3. Set up monitoring and logging for the frontend application
