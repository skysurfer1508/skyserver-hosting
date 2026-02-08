
# Analysis: API Errors in Container Logs

## Investigation Summary

After reviewing the codebase, here's what I found:

### The `/api/apps/null/analytics/track/batch` Request

This request is **NOT coming from your application**. Your SkyServer application:
- Only communicates with Supabase directly (via `supabase.co` URLs)
- Uses Google Analytics via gtag.js script (which goes to `googletagmanager.com`)
- Does not make any `/api/` calls in the codebase

This analytics endpoint pattern (`/api/apps/{app_id}/analytics/track/batch`) is from **Lovable's internal preview system**. In production on your own Docker container, you should not see these requests at all.

### Why You See 405 Errors

When any request hits `/api/`, Nginx has no handler for it, so it falls back to serving `index.html` (the SPA catch-all). For POST requests to a static file, Nginx returns 405 "Method Not Allowed". This is expected behavior - it's Nginx correctly rejecting an unsupported request method.

### What Actually Needs Fixing

**Nothing needs to be added for API proxying** - your application doesn't have a backend API service. The architecture is:

```text
┌─────────────────────────────────────────────────────────┐
│ Your Docker Container (Port 7012)                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Nginx (Static Files + SPA)                          │ │
│ │ • Serves React app from /usr/share/nginx/html       │ │
│ │ • Handles SPA routing via try_files                 │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────┐
          │ Supabase (External Service)    │
          │ ccomlhxhigqqmoexpmyy.supabase.co│
          │ • Database                     │
          │ • Authentication               │
          │ • Edge Functions               │
          └────────────────────────────────┘
```

---

## Recommended Actions

### Option A: Ignore These Logs (Recommended)

The 405 errors for `/api/` requests are harmless - they're either:
1. Bots/scanners probing for API endpoints
2. Stale requests from browser caching during development

Your app works correctly without any API proxy configuration.

### Option B: Add a Clean 404 Response for `/api/`

If you want cleaner logs, you can add a block that returns a proper 404 for any `/api/` requests, making it clear the endpoint doesn't exist:

**Changes to `nginx.conf`:**

Add before the SPA location block:

```nginx
# Return 404 for any /api/ requests (no backend exists)
location /api/ {
    return 404;
}
```

This simply tells any `/api/` request that the endpoint doesn't exist, which is accurate.

---

## Summary

| Issue | Cause | Action Required |
|-------|-------|-----------------|
| `/api/apps/null/...` in URL | Lovable preview system (not your app) | None - doesn't affect production |
| 405 Not Allowed | Nginx rejecting POST to static file route | Optional: Add clean 404 for `/api/` |
| Missing environment variable | None found - your app only uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` | Verify these are passed correctly during Docker build |

### Docker Build Verification

When building, ensure you pass the environment variables:

```bash
docker-compose build \
  --build-arg VITE_SUPABASE_URL="https://ccomlhxhigqqmoexpmyy.supabase.co" \
  --build-arg VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb21saHhoaWdxcW1vZXhwbXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MjMzMzcsImV4cCI6MjA4NTk5OTMzN30.pmX6v2EJZARQHY7tDx13GidW50YnXQ-KeiGNE5NcwtM"
```

Or add the build args to `docker-compose.yml` for convenience:

```yaml
services:
  skyserver-web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_SUPABASE_URL: "https://ccomlhxhigqqmoexpmyy.supabase.co"
        VITE_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    ports:
      - "7012:7012"
    restart: always
```
