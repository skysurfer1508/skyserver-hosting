

# Plan: Fix Nginx Configuration for Proper Health Checks

## Problem Analysis
You're experiencing:
- **Black screen**: Likely due to failed asset loading or routing issues
- **Unhealthy status**: The healthcheck may be probing the wrong port
- **405 Method Not Allowed**: API requests hitting nginx instead of your backend

## Current Configuration Status
Your current setup (`7012:80` mapping) is actually valid, but there's a mismatch in your docker-compose healthcheck which references port 7012 instead of letting Docker use the internal check.

## Proposed Fixes

### 1. Simplify nginx.conf
Replace the complex nginx.conf with a minimal configuration that listens on port 80 (standard for containers):

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Fix for React Router (SPA) - redirects 404s to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Error pages
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

### 2. Update Dockerfile
Keep the Dockerfile as-is since it correctly:
- Exposes port 80
- Health checks `localhost:80/health`

### 3. Fix docker-compose.yml
Remove any external healthcheck that references port 7012, since Docker's internal health check handles this:

```yaml
version: '3.8'

services:
  skyserver-web:
    container_name: skyserver_website
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "7012:80"
    restart: always
```

## Technical Details

| Component | Port Inside Container | Port on Host |
|-----------|----------------------|--------------|
| Nginx | 80 | 7012 |
| Health Check | 80 (internal) | N/A |

## Request Flow
```text
External Request → Host:7012 → Container:80 → Nginx → Static Files/SPA
```

## Why the 405 Error Occurs
The "405 Method Not Allowed" happens when:
1. Your frontend makes API calls to relative paths (e.g., `/api/something`)
2. These hit nginx instead of your actual backend
3. Nginx returns 405 because it's a static file server

**Solution**: Ensure your frontend uses absolute URLs for API calls (e.g., `https://ccomlhxhigqqmoexpmyy.supabase.co/...`) - which your Supabase client already does.

## After Deployment
Run these commands:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
docker-compose ps  # Verify health status
```

