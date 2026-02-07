
# Plan: Fix Docker Compose Port Mapping

## Problem
The Docker Compose configuration has a port mismatch:
- **Current**: Host port 7012 → Container port 80
- **App runs on**: Container port 7012

This causes "Connection refused" because Docker is forwarding traffic to the wrong internal port.

## Solution

### File: `docker-compose.yml`

Update the ports mapping from `"7012:80"` to `"7012:7012"` and update the comment:

```yaml
version: '3.8'

services:
  skyserver-web:
    container_name: skyserver_website
    build:
      context: .
      dockerfile: Dockerfile
    # Maps port 7012 on host to port 7012 in container
    ports:
      - "7012:7012" 
    restart: always
```

## After This Change

The port flow will be:
- External request → Host:7012 → Container:7012 → Vite preview server

This aligns with the Dockerfile which exposes port 7012 and runs the preview server on that port.
