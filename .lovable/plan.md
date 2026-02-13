

# Add "Rust" as a New Game

## Overview
Adding Rust as a 6th supported game requires changes across the database, configuration forms, type definitions, and all UI components that reference the list of games.

## 1. Database Migration

Two changes needed:
- Add `'rust'` to the `game_type` enum
- Insert a row into `game_limits` with default values

```text
ALTER TYPE public.game_type ADD VALUE IF NOT EXISTS 'rust';

INSERT INTO public.game_limits (game_name, max_slots, is_active)
VALUES ('rust', 10, true)
ON CONFLICT DO NOTHING;
```

## 2. New Config Form: `RustConfigForm.tsx`

Create `src/components/dashboard/RustConfigForm.tsx` with Rust-specific server settings. Suggested fields:

| Field | Type | Options |
|-------|------|---------|
| Map Size | select | Small (3000), Medium (4000), Large (6000) |
| Max Players | number input | Default 50 |
| Server Wipe Schedule | select | Weekly, Biweekly, Monthly, None |

This follows the same pattern as `SatisfactoryConfigForm`, `FactorioConfigForm`, etc.

## 3. Type Updates (8 files)

Every file that defines `GameType` or `GameName` needs `'rust'` added:

| File | Change |
|------|--------|
| `src/hooks/useGameLimits.tsx` | Add `'rust'` to `GameName` type |
| `src/hooks/useServerRequest.tsx` | Add `'rust'` to `GameType` type |
| `src/components/landing/GameCard.tsx` | Add `'rust'` to `GameName` type |
| `src/components/landing/ServerRequestModal.tsx` | Add `'rust'` to `GameType`, add to `gameOptions`, add config form rendering, add validation |
| `src/components/dashboard/ServerStatusCard.tsx` | Add `'rust'` to `GameType`, add to `gameOptions`, add config form rendering |
| `src/components/landing/FeaturesSection.tsx` | Add Rust entry to `gameData` array (needs a new accent color -- `red`) |
| `src/components/admin/AdminSettings.tsx` | Add `rust` to `gameLabels` and `editedGameLimits` default state |
| `src/components/landing/HeroSection.tsx` | Update "5 Games Supported" stat to "6" |

## 4. GameCard Accent Color

Add a `red` accent color to `GameCard.tsx` for Rust's signature look:

```text
red: {
  header: 'bg-red-500/10 border-red-500/30',
  icon: 'bg-red-500/20 ring-red-500/40',
  text: 'text-red-400',
  badge: 'bg-red-500/15 text-red-400 border-red-500/30',
  button: 'bg-red-600 hover:bg-red-500 text-white',
  glow: 'hover:shadow-red-500/25',
  shadowColor: 'rgba(239, 68, 68, 0.25)',
}
```

## 5. Features Section Game Card Entry

```text
{
  gameName: 'rust',
  title: 'Rust',
  icon: '🔥',
  description: 'Survive, build, and dominate in one of the most brutal multiplayer survival games.',
  tags: ['Survival', 'PvP & PvE', 'Base Building'],
  accentColor: 'red',
}
```

## 6. Grid Layout Adjustment

The current grid is `xl:grid-cols-5` for 5 games. With 6 games, it changes to `xl:grid-cols-3` (2 rows of 3) for a balanced layout.

## Summary of All Files Changed

| File | Type of Change |
|------|---------------|
| New migration SQL | Add enum value + game_limits row |
| `src/components/dashboard/RustConfigForm.tsx` | **New file** -- config form |
| `src/hooks/useGameLimits.tsx` | Add 'rust' to type |
| `src/hooks/useServerRequest.tsx` | Add 'rust' to type |
| `src/components/landing/GameCard.tsx` | Add 'rust' to type + red accent |
| `src/components/landing/ServerRequestModal.tsx` | Add rust option + config + validation |
| `src/components/dashboard/ServerStatusCard.tsx` | Add rust option + config rendering |
| `src/components/landing/FeaturesSection.tsx` | Add Rust game card data + adjust grid |
| `src/components/admin/AdminSettings.tsx` | Add rust to labels + default state |
| `src/components/landing/HeroSection.tsx` | Change "5" to "6" games |

