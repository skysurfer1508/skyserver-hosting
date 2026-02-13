

# Add Per-Game Default Specs to Admin Panel

## Overview
Currently, the base server specs (2.5 GB RAM, 100% CPU) are hardcoded constants in the upgrade page. This plan adds editable default specs per game to the `game_limits` table so admins can configure them from the Command Center.

## Database Change

Add two new columns to the `game_limits` table:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `base_ram_mb` | integer | 2560 | Default RAM in MB (2560 = 2.5 GB) |
| `base_cpu_percent` | integer | 100 | Default CPU percentage |

Migration SQL:
```text
ALTER TABLE public.game_limits
  ADD COLUMN base_ram_mb integer NOT NULL DEFAULT 2560,
  ADD COLUMN base_cpu_percent integer NOT NULL DEFAULT 100;
```

## Frontend Changes

### 1. Admin Settings -- Add Default Specs Inputs
In `src/components/admin/AdminSettings.tsx`, add two input fields (Base RAM and Base CPU) inside each game's capacity card, below the existing "Max Slots" input. Admins can set different defaults per game (e.g., CS2 might need more CPU by default).

The local state and save handler will be extended to include `baseRamMb` and `baseCpuPercent` per game.

### 2. Hook Update -- `useGameLimits.tsx`
- Add `base_ram_mb` and `base_cpu_percent` to the `GameLimit` interface
- Include them in the fetched data and the `updateGameLimit` function parameters

### 3. Upgrade Page -- Read Specs from DB
In `src/pages/ServerUpgrade.tsx`:
- Remove the hardcoded `BASE_RAM_GB` and `BASE_CPU_PERCENT` constants
- Import `useGameLimits` and look up the current server's game type to get the correct base specs
- Display the per-game defaults in the "Current Server Specs" card

## Files Changed

| File | Change |
|------|--------|
| `game_limits` table | Add `base_ram_mb` and `base_cpu_percent` columns |
| `src/hooks/useGameLimits.tsx` | Extend interface and update function |
| `src/components/admin/AdminSettings.tsx` | Add Base RAM / Base CPU inputs per game |
| `src/pages/ServerUpgrade.tsx` | Read base specs from DB instead of constants |

