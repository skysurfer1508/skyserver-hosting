
# Dynamic Slot Availability System

## Overview

This plan implements a per-game slot management system to replace the current global slot counter. Each game (Minecraft, Terraria, Satisfactory) will have its own maximum capacity, with real-time calculation of used slots based on active/pending server requests.

---

## Phase 1: Database Schema Update

### 1.1 Create New `game_limits` Table

A dedicated table to store per-game slot configurations:

| Column | Type | Nullable | Default | Purpose |
|--------|------|----------|---------|---------|
| `game_name` | TEXT | No | - | Primary Key (minecraft, terraria, satisfactory) |
| `max_slots` | INTEGER | No | 10 | Maximum servers allowed |
| `is_active` | BOOLEAN | No | true | Enable/disable game for requests |
| `created_at` | TIMESTAMPTZ | No | now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | now() | Last update timestamp |

### 1.2 Insert Initial Data

```sql
INSERT INTO game_limits (game_name, max_slots, is_active) VALUES
  ('minecraft', 20, true),
  ('terraria', 10, true),
  ('satisfactory', 10, true);
```

### 1.3 Create Database Function for Slot Counting

Create a function to calculate used slots per game dynamically:

```sql
CREATE FUNCTION get_game_slot_usage(game TEXT)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM server_requests
  WHERE game_type::text = game
    AND status IN ('pending', 'active')
$$ LANGUAGE SQL STABLE;
```

### 1.4 RLS Policies

- **Public read access**: Anyone can view game limits (for landing page display)
- **Admin-only update**: Only admins can modify slot limits

---

## Phase 2: Create New React Hook

### 2.1 `useGameLimits` Hook

Location: `src/hooks/useGameLimits.tsx`

This hook will:
- Fetch game limits from the `game_limits` table
- Calculate used slots for each game by counting server_requests
- Return availability data for UI display

**Returns:**
```typescript
interface GameSlotData {
  game_name: 'minecraft' | 'terraria' | 'satisfactory';
  max_slots: number;
  used_slots: number;
  available_slots: number;
  is_active: boolean;
  is_full: boolean;
}
```

---

## Phase 3: Update Landing Page - FeaturesSection

### 3.1 Refactor Games Display

Transform the simple game badges into interactive cards showing:

- Game icon and name
- Progress bar showing capacity (used/max)
- "X / Y Servers Claimed" text
- Visual status:
  - **Available** (green accent): Normal "Select" button
  - **Full** (red/grey accent): Disabled "Sold Out" button

### 3.2 UI States

| Condition | Progress Bar Color | Button Text | Button State |
|-----------|-------------------|-------------|--------------|
| Available | Primary (green/blue) | "Select Game" | Enabled |
| Almost Full (>80%) | Warning (amber) | "Select Game" | Enabled |
| Full (used >= max) | Destructive (red) | "Sold Out" | Disabled |
| Game Disabled | Muted (grey) | "Unavailable" | Disabled |

---

## Phase 4: Admin Panel - Game Capacity Management

### 4.1 Add New Section

Add a "Game Capacity Management" card to the Admin sidebar with:

- List of all 3 games
- Current usage display: "X / Y active"
- Editable `max_slots` input for each game
- Toggle switch for `is_active` status
- Save button to update limits

### 4.2 Visual Layout

```text
+----------------------------------+
| Game Capacity Management         |
+----------------------------------+
| ⛏️ Minecraft                     |
| [======----] 12 / 20 active      |
| Max Slots: [20 ▼]  Active: [✓]   |
+----------------------------------+
| 🌳 Terraria                      |
| [====------]  4 / 10 active      |
| Max Slots: [10 ▼]  Active: [✓]   |
+----------------------------------+
| 🏭 Satisfactory                  |
| [----------]  0 / 10 active      |
| Max Slots: [10 ▼]  Active: [✓]   |
+----------------------------------+
| [       Save Changes       ]     |
+----------------------------------+
```

---

## Phase 5: Request Form Integration

### 5.1 Update ServerStatusCard

When selecting a game in the request modal:
- Check if that game `is_active`
- Check if `used_slots < max_slots`
- If game is full or disabled, show warning and disable submit

### 5.2 Real-Time Feedback

Display slot availability info next to game dropdown:
- "5 slots available" (green)
- "Only 2 slots left!" (amber warning)
- "No slots available" (red, disabled)

---

## Files to be Modified

| File | Changes |
|------|---------|
| Database | New `game_limits` table + function |
| `src/hooks/useGameLimits.tsx` | **New file** - Hook for game slot data |
| `src/components/landing/FeaturesSection.tsx` | Add slot display with progress bars |
| `src/pages/Admin.tsx` | Add Game Capacity Management section |
| `src/components/dashboard/ServerStatusCard.tsx` | Check game availability before submit |
| `src/integrations/supabase/types.ts` | Auto-updated by migration |

---

## Technical Details

### Database Migration SQL

```sql
-- Create game_limits table
CREATE TABLE public.game_limits (
  game_name TEXT PRIMARY KEY,
  max_slots INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_limits ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "Anyone can read game limits"
  ON public.game_limits FOR SELECT
  USING (true);

-- Admins can update
CREATE POLICY "Admins can update game limits"
  ON public.game_limits FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Insert initial data
INSERT INTO public.game_limits (game_name, max_slots, is_active) VALUES
  ('minecraft', 20, true),
  ('terraria', 10, true),
  ('satisfactory', 10, true);

-- Create function to get slot usage per game
CREATE OR REPLACE FUNCTION public.get_game_slot_usage(game_name_param TEXT)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.server_requests
  WHERE game_type::text = game_name_param
    AND status IN ('pending', 'active')
$$;

-- Update timestamp trigger
CREATE TRIGGER update_game_limits_updated_at
  BEFORE UPDATE ON public.game_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

### useGameLimits Hook Structure

```typescript
interface GameLimit {
  game_name: string;
  max_slots: number;
  is_active: boolean;
  used_slots: number;
  available_slots: number;
  is_full: boolean;
}

function useGameLimits() {
  // 1. Fetch all game_limits rows
  // 2. For each game, call RPC to get used_slots count
  // 3. Calculate available_slots and is_full
  // 4. Return array of GameLimit objects + update function
}
```

### Slot Calculation Logic

```text
used_slots = COUNT(*) FROM server_requests 
             WHERE game_type = game AND status IN ('pending', 'active')

available_slots = max_slots - used_slots
is_full = used_slots >= max_slots
```

---

## Summary

1. **Database**: New `game_limits` table with per-game max_slots and is_active flags
2. **Slot Calculation**: Dynamic counting from `server_requests` (not stored values)
3. **Landing Page**: Game cards with progress bars and availability status
4. **Admin Panel**: New section to manage per-game capacity
5. **Request Form**: Validate game availability before allowing submission
