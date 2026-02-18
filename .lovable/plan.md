

## Live Statistics Section for Landing Page

Add a "Live Statistics" section to the landing page that fetches real-time data from the Pterodactyl Panel via a secure backend function, with animated count-up numbers and cyberpunk styling.

### Architecture

The Pterodactyl API key stays securely on the backend. A new backend function fetches stats from the panel, caches them in a database table (refreshed every 5 minutes), and serves them to the frontend without exposing any credentials.

```text
Frontend (Landing Page)
   |
   v
Edge Function: panel-stats (public, no auth needed)
   |
   v
Cache table: panel_stats_cache (single row, updated every 5 min)
   |
   v
Pterodactyl API (https://panel.skyserver1508.org/api/application/*)
```

### Prerequisites

A new secret **PTERODACTYL_API_KEY** must be added to the project. This is the Application API key from the Pterodactyl Panel (found under Admin > Application API).

### Database Changes

**New table: `panel_stats_cache`**
- `id` (integer, primary key, default 1) -- single-row cache
- `total_servers` (integer)
- `total_users` (integer)
- `total_ram_mb` (bigint) -- sum of all server memory limits in MB
- `nodes_online` (integer)
- `updated_at` (timestamptz)

RLS: SELECT allowed for everyone (public data), no INSERT/UPDATE/DELETE from client side.

### New Edge Function: `panel-stats`

**File:** `supabase/functions/panel-stats/index.ts`

- Public endpoint (no JWT required)
- On each call, checks `panel_stats_cache.updated_at`
- If stale (older than 5 minutes), fetches fresh data from Pterodactyl API:
  - `GET /api/application/servers` -- count total + sum memory limits
  - `GET /api/application/users` -- count total
  - `GET /api/application/nodes` -- count total
- Upserts the cache row and returns the stats as JSON
- If fresh, returns cached data directly
- Uses `PTERODACTYL_API_KEY` from environment (never exposed to frontend)
- Paginates through all API pages to get accurate totals

### New Frontend Component: `LiveStatsSection`

**File:** `src/components/landing/LiveStatsSection.tsx`

- 4-card horizontal grid with icons:
  - **Total Servers** (Server icon) -- e.g., "24"
  - **Happy Gamers** (Users icon) -- e.g., "156"
  - **RAM Powered** (MemoryStick/Cpu icon) -- e.g., "12.4 GB"
  - **Nodes Online** (Network icon) -- e.g., "2"
- Count-up animation triggered by scroll visibility (using existing `useScrollReveal` hook)
- Numbers animate from 0 to target value over ~2 seconds when section scrolls into view
- Styled with the existing gaming-card / cyberpunk dark theme with primary (neon blue/cyan) accents
- Fetches data from the edge function via `supabase.functions.invoke('panel-stats')`
- Shows skeleton loading state while fetching
- Gracefully falls back to "--" if the fetch fails

### Modified Files

**`src/pages/Index.tsx`**
- Import and add `<LiveStatsSection />` between `<HeroSection />` and `<NewsSection />`

### Visual Layout

```text
+----------------------------------------------------+
|              Live Platform Statistics               |
|                                                     |
|  +----------+  +----------+  +--------+  +-------+ |
|  | Server   |  | Users    |  | Cpu    |  | Globe | |
|  |   24     |  |   156    |  | 12.4GB |  |   2   | |
|  | Servers  |  | Happy    |  | RAM    |  | Nodes | |
|  | Deployed |  | Gamers   |  | Powered|  | Online| |
|  +----------+  +----------+  +--------+  +-------+ |
+----------------------------------------------------+
```

Each card uses the existing `gaming-card` class with a glowing icon in `bg-primary/10`, matching the `StatCard` pattern used in the admin panel.

