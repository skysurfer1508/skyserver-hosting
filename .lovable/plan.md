
# Plan: Switch to Nginx for Production Serving

## Problem
Vite 5.4.19 has a security feature that blocks requests from unrecognized hosts. The `allowedHosts: true` configuration option is not being respected by the preview server, causing persistent "Blocked request" errors for your domain.

## Solution
Switch the Docker container from Vite's preview server to nginx. You already have a well-configured `nginx.conf` file in the project - we just need to update the Dockerfile to use it.

**Why nginx is better for production:**
- No host checking restrictions
- Better performance and caching
- Smaller container image size
- Industry standard for serving static files
- Already configured with gzip, security headers, and SPA routing

## Changes Required

### 1. Update Dockerfile

Replace the current Node-based production stage with nginx:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - use nginx
FROM nginx:alpine AS production

# Copy built assets to nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 7012
EXPOSE 7012

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:7012/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### 2. Update nginx.conf

Change the listen port from 80 to 7012 to match your Docker setup:

```nginx
server {
    listen 7012;  # Changed from 80
    server_name localhost;
    # ... rest stays the same
}
```

## After These Changes

The request flow will be:
- External request to www.skyserver1508.org 
- Host:7012 → Container:7012 → nginx (no host checking!)

## Deployment Steps
After approving, rebuild your container:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Technical Details

| Aspect | Current (Vite) | New (nginx) |
|--------|---------------|-------------|
| Base image | node:20-alpine (~180MB) | nginx:alpine (~40MB) |
| Host checking | Yes (problematic) | No |
| Performance | Development-grade | Production-grade |
| Caching | Basic | Advanced (already configured) |
| Gzip | No | Yes (already configured) |
