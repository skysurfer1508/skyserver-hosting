
# Dynamic Game Specs from Database

## Summary
Replace the hardcoded specs on each game detail page with live data pulled from the `game_limits` database table, and update Storage and Players to show "Unlimited".

## What Changes

### 1. Update `src/pages/GameDetail.tsx`
- Fetch the game's limits from the `game_limits` table using the slug (which matches `game_name` in the DB).
- Build the specs bar dynamically:
  - **RAM**: From `base_ram_mb` (e.g., 2560 -> "2.5 GB")
  - **CPU**: From `base_cpu_percent` (e.g., 100 -> "100%", 300 -> "300%")
  - **Storage**: Always "Unlimited"
  - **DDoS Protection**: Always "Included"
  - **Players**: Always "Unlimited"
- Show a loading skeleton while the data loads; fall back to the static specs from `gameDetails.ts` if the fetch fails.

### 2. Update `src/data/gameDetails.ts`
- Remove the per-game `specs` arrays (or keep them as fallback defaults).
- Update the `GameDetail` interface -- the `specs` field becomes optional since it will be overridden by live data.

### 3. No database changes needed
The `game_limits` table already has `base_ram_mb` and `base_cpu_percent` per game, and is publicly readable via RLS.

## Technical Details

The component will use a simple `useEffect` + Supabase query:

```text
supabase.from('game_limits').select('base_ram_mb, base_cpu_percent').eq('game_name', slug).single()
```

Then construct specs array:
- RAM: `(base_ram_mb / 1024)` GB (or MB if < 1024)
- CPU: `base_cpu_percent + "%"`
- Storage: "Unlimited"
- DDoS Protection: "Included"
- Players: "Unlimited"

The static `specs` in `gameDetails.ts` will remain as fallback but will be overridden by the live DB values when available.
