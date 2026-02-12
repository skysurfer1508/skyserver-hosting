
# Update Game Count and Fix Admin Panel

## Two Quick Fixes

### 1. Hero Section -- Update "Games Supported" stat
In `src/components/landing/HeroSection.tsx`, change the stat from `3` to `5`.

### 2. Admin Settings -- Add missing game labels
In `src/components/admin/AdminSettings.tsx`, the `gameLabels` object on line 27-31 only includes Minecraft, Terraria, and Satisfactory. CS2 and Factorio are missing, so they show up with no name or icon in the Capacity Management panel.

Add:
- `cs2: { label: 'Counter-Strike 2', icon: '🔫' }`
- `factorio: { label: 'Factorio', icon: '⚙️' }`

## Files Changed

| File | Change |
|------|--------|
| `src/components/landing/HeroSection.tsx` | Change "3" to "5" on line 95 |
| `src/components/admin/AdminSettings.tsx` | Add cs2 and factorio entries to `gameLabels` on lines 27-31 |
