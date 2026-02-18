

## Add "Free vs. Permanent" Comparison Page

A new `/compare` page with dynamic game specs fetched from the backend, accessible via the hamburger menu.

### What will be built

1. **New page** at `/compare` showing a comparison between Free and Permanent tiers
2. **Per-game spec cards** with dynamic RAM/CPU values from `game_limits` table via `useGameLimits()`
3. **Feature comparison table** (server lifetime, support level, queue priority, etc.)
4. **"Upgrade Now" CTA** linking to dashboard
5. **Navigation link** added only to the hamburger menu (not the header bar)

### Files changed

**New file: `src/pages/Compare.tsx`**
- Uses `useGameLimits()` hook to fetch dynamic free-tier specs
- Displays per-game cards with Free vs Permanent columns
- General feature comparison table
- Loading state while fetching
- Wrapped in existing `Layout` component

**Modified: `src/App.tsx`**
- Add route: `<Route path="/compare" element={<Compare />} />`

**Modified: `src/components/layout/Header.tsx`**
- Add "Free vs. Permanent" entry to the `navItems` array with `isRoute: true` so it appears in the hamburger menu on all pages
- No changes to the top header bar

### Page structure

```text
+------------------------------------------+
|         Free vs. Permanent               |
|   Compare what each tier offers          |
+------------------------------------------+
|                                          |
|  Per-Game Cards (6 games):               |
|  +----------------------------------+   |
|  |  Minecraft                       |   |
|  |  FREE        |  PERMANENT        |   |
|  |  2.5 GB RAM  |  +8 GB extra      |   |
|  |  100% CPU    |  +800% extra      |   |
|  |  7-day lease |  Never expires    |   |
|  +----------------------------------+   |
|  ... (repeat for active games)       |   |
|                                          |
+------------------------------------------+
|  Feature Comparison Table                |
|  Server Lifetime: 7 days vs Forever      |
|  Support: Standard vs Priority           |
|  Queue: Normal vs Priority               |
|  Extra Resources: No vs Yes              |
+------------------------------------------+
|        [ Upgrade Now Button ]            |
+------------------------------------------+
```

### Technical details

- `useGameLimits()` returns `base_ram_mb` and `base_cpu_percent` per game -- these are converted for display (e.g., 2560 MB to "2.5 GB")
- Only active games (`is_active: true`) are shown
- Game icons/names mapped using the same pattern as the landing page
- No database changes needed -- all data already exists in `game_limits` table
- The hamburger menu entry uses `isRoute: true` so it navigates directly and appears on all pages (not just the home page)

