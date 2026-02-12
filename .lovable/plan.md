

# Add CS2 and Factorio Game Support

## Overview
Add Counter-Strike 2 and Factorio as new supported game types across the full stack: database enum, game limits, frontend components, and config forms.

## Changes

### 1. Database Migration
- Extend the `game_type` enum with two new values: `cs2` and `factorio`
- Insert new rows into the `game_limits` table for both games (default 10 slots each, active)

### 2. New Config Form Components
- **`CS2ConfigForm.tsx`** -- Game mode selector (competitive, casual, deathmatch, wingman) and map input field
- **`FactorioConfigForm.tsx`** -- Save name input and a visibility selector (public/LAN-only)

### 3. Frontend Type Updates
Extend the `GameType` / `GameName` union type in all relevant files to include `'cs2' | 'factorio'`:

| File | What Changes |
|------|-------------|
| `src/hooks/useGameLimits.tsx` | Add `cs2` and `factorio` to the `GameName` type |
| `src/components/landing/GameCard.tsx` | Add `cs2` and `factorio` to its local `GameName` type |
| `src/components/landing/FeaturesSection.tsx` | Add two new entries to the `gameData` array (CS2 in blue, Factorio in amber) and add two new accent colors |
| `src/components/landing/ServerRequestModal.tsx` | Add CS2/Factorio to `GameType`, `gameOptions`, config form rendering, and validation; add a resource hint for CS2 ("Recommended: at least 2 CPU boost and 4GB RAM") |
| `src/components/dashboard/ServerStatusCard.tsx` | Same changes as ServerRequestModal: update type, gameOptions, config rendering, validation |
| `src/hooks/useServerRequest.tsx` | Extend local `GameType` to include new values |

### 4. GameCard Accent Colors
Add two new color schemes to `GameCard.tsx`:
- **`blue`** for CS2 (sky-500 palette)
- **`amber`** for Factorio (amber-500 palette)

Update the `accentColor` prop type to include `'blue' | 'amber'`.

### 5. Grid Layout
The game card grid in `FeaturesSection.tsx` will update from `md:grid-cols-3` to a responsive layout that handles 5 cards nicely (e.g., `lg:grid-cols-5` or a 3+2 split with `md:grid-cols-3`).

## Technical Details

### Database SQL
```sql
-- Add new enum values
ALTER TYPE public.game_type ADD VALUE IF NOT EXISTS 'cs2';
ALTER TYPE public.game_type ADD VALUE IF NOT EXISTS 'factorio';

-- Add game limit rows
INSERT INTO public.game_limits (game_name, max_slots, is_active)
VALUES ('cs2', 10, true), ('factorio', 10, true);
```

### New Files
| File | Purpose |
|------|---------|
| `src/components/dashboard/CS2ConfigForm.tsx` | Game mode + map config for CS2 |
| `src/components/dashboard/FactorioConfigForm.tsx` | Save name + visibility config for Factorio |

### Modified Files (summary)
| File | Change |
|------|--------|
| `src/hooks/useGameLimits.tsx` | Extend `GameName` type |
| `src/hooks/useServerRequest.tsx` | Extend `GameType` |
| `src/components/landing/GameCard.tsx` | Add blue/amber accent colors, extend types |
| `src/components/landing/FeaturesSection.tsx` | Add CS2 + Factorio cards, update grid |
| `src/components/landing/ServerRequestModal.tsx` | Add game options, config forms, validation, CS2 resource warning |
| `src/components/dashboard/ServerStatusCard.tsx` | Mirror modal changes for dashboard |

### CS2 Resource Warning
When CS2 is selected in the request modal, a small info alert will appear: "Recommended: at least 2 CPU boost and 4GB RAM for a smooth experience."

### No Edge Function Changes Needed Now
The user mentioned updating a `create-server` edge function, but no such function exists in the codebase. The server provisioning is handled externally. The Pterodactyl Egg ID constants can be added later when the admin provides the actual IDs -- this plan focuses on what can be built and tested now.

