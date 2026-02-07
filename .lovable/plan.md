

# Complete Refactor: Server Request Flow, Database Schema, and Dashboard UI

## Overview

This plan covers a comprehensive refactor of the SkyServer platform to:
- Limit games to only Minecraft, Terraria, and Satisfactory
- Enforce a one-server-per-user policy
- Add dynamic game-specific configuration fields
- Clean up the Dashboard UI
- Update the database schema with new columns

---

## Phase 1: Database Schema Update

### 1.1 Update game_type Enum

Remove Valheim and ARK from the allowed game types:

```sql
-- Drop the old enum and recreate with only 3 games
-- This requires updating any existing rows first
```

**Note:** Since we may have existing data, we will:
1. Create a new enum type
2. Alter the column to use the new type
3. Drop the old type

### 1.2 Add New Columns to server_requests Table

| Column | Type | Nullable | Purpose |
|--------|------|----------|---------|
| `discord_username` | TEXT | NOT NULL | User's Discord handle for support |
| `description` | TEXT | NULL | Project description |
| `server_config` | JSONB | NULL | Game-specific configuration |

### 1.3 Add One-Server Constraint

Create a partial unique index to enforce that each user can only have one non-rejected server request:

```sql
CREATE UNIQUE INDEX one_active_request_per_user 
ON server_requests (user_id) 
WHERE status IN ('pending', 'active');
```

This allows:
- One pending OR one active request per user
- Multiple rejected requests (historical)
- Users can request again after rejection

---

## Phase 2: Dashboard UI Cleanup

### 2.1 Remove "Server Capacity" Card

Delete the card showing "0/50 slots used" from the Dashboard sidebar. This information is admin-only and misleading for regular users.

### 2.2 Simplify Dashboard Layout

The Dashboard will show:
- **Left (main area):** ServerStatusCard with the request form or server status
- **Right sidebar:**
  - Platform Status card (online/maintenance indicator)
  - Help card (Discord link)

---

## Phase 3: Landing Page Update

### 3.1 Update Games List

In `FeaturesSection.tsx`:
- Remove Valheim and ARK from the supported games display
- Keep only: Minecraft, Terraria, Satisfactory

### 3.2 Hero Section - Request Server Button

Add a prominent "Request Server" button that:
- Links to `/register` for unauthenticated users (existing behavior)
- Could optionally link to `/dashboard` for logged-in users

---

## Phase 4: Dynamic Request Form (Core Feature)

### 4.1 Form Structure

**Common Fields (Always Visible):**
| Field | Type | Required |
|-------|------|----------|
| Game Selector | Dropdown | Yes |
| Server Name | Text Input | Yes |
| Discord Username | Text Input | Yes |
| Description | Textarea | No |

### 4.2 Game-Specific Fields (Saved to server_config JSONB)

**Minecraft:**
| Field | Type | Options |
|-------|------|---------|
| Edition | Dropdown | Java Edition, Bedrock Edition |
| Server Software | Dropdown | Vanilla, Paper (Plugins), Fabric (Mods), Forge (Mods) |
| Version | Text Input | e.g., "1.20.4" |
| EULA Agreement | Checkbox | Required |

**Terraria:**
| Field | Type | Options |
|-------|------|---------|
| Software | Dropdown | Vanilla, tModLoader |
| World Size | Dropdown | Small, Medium, Large |
| Difficulty | Dropdown | Classic, Expert, Master, Journey |

**Satisfactory:**
| Field | Type | Options |
|-------|------|---------|
| Branch | Dropdown | Early Access (Stable), Experimental |

### 4.3 JSONB Structure Example

```json
// Minecraft
{
  "edition": "java",
  "software": "paper",
  "version": "1.20.4",
  "eula_accepted": true
}

// Terraria
{
  "software": "vanilla",
  "world_size": "large",
  "difficulty": "expert"
}

// Satisfactory
{
  "branch": "early_access"
}
```

### 4.4 Form Validation

- All common required fields must be filled
- Game-specific required fields validated dynamically:
  - Minecraft: EULA checkbox must be checked
  - Terraria: All dropdowns required
  - Satisfactory: Branch required
- Discord username validation (basic format check)

---

## Phase 5: One-Server Policy Enforcement

### 5.1 Frontend Check

In `useServerRequest` hook:
- Check if user already has a pending or active request
- Return `hasActiveRequest: boolean` flag

### 5.2 UI Behavior

When `hasActiveRequest` is true:
- Disable "Request Server" button
- Show tooltip: "You already have a server request"
- Display existing server status instead

### 5.3 Backend Enforcement

The database constraint (`one_active_request_per_user` unique index) ensures this at the database level, providing defense in depth.

---

## Phase 6: Admin Panel Updates

### 6.1 Update Game Labels

Remove Valheim and ARK from the `gameLabels` object in Admin.tsx.

### 6.2 Display New Fields

In the requests table:
- Add Discord Username column
- Show server_config details in an expandable row or tooltip

---

## Files to be Modified

| File | Changes |
|------|---------|
| `supabase/migrations/[new].sql` | New schema migration |
| `src/integrations/supabase/types.ts` | Will auto-update after migration |
| `src/components/dashboard/ServerStatusCard.tsx` | Complete refactor with dynamic form |
| `src/components/landing/FeaturesSection.tsx` | Remove Valheim/ARK |
| `src/pages/Dashboard.tsx` | Remove capacity card |
| `src/pages/Admin.tsx` | Update game labels, show new fields |
| `src/hooks/useServerRequest.tsx` | Add new fields to createRequest, add hasActiveRequest check |

---

## New Components to Create

| Component | Purpose |
|-----------|---------|
| `src/components/dashboard/MinecraftConfigForm.tsx` | Minecraft-specific fields |
| `src/components/dashboard/TerrariaConfigForm.tsx` | Terraria-specific fields |
| `src/components/dashboard/SatisfactoryConfigForm.tsx` | Satisfactory-specific fields |

---

## Technical Implementation Details

### Database Migration SQL

```sql
-- Add new columns to server_requests
ALTER TABLE public.server_requests 
ADD COLUMN discord_username TEXT,
ADD COLUMN description TEXT,
ADD COLUMN server_config JSONB;

-- Make discord_username NOT NULL with a default for existing rows
UPDATE public.server_requests SET discord_username = 'unknown' WHERE discord_username IS NULL;
ALTER TABLE public.server_requests ALTER COLUMN discord_username SET NOT NULL;

-- Create unique partial index for one-server policy
CREATE UNIQUE INDEX one_active_request_per_user 
ON public.server_requests (user_id) 
WHERE status IN ('pending', 'active');

-- Update game_type enum (remove valheim and ark)
-- Create new enum
CREATE TYPE public.game_type_new AS ENUM ('minecraft', 'terraria', 'satisfactory');

-- Update existing rows (change valheim/ark to minecraft as fallback)
UPDATE public.server_requests 
SET game_type = 'minecraft' 
WHERE game_type::text IN ('valheim', 'ark');

-- Alter column to use new enum
ALTER TABLE public.server_requests 
ALTER COLUMN game_type TYPE public.game_type_new 
USING (game_type::text::public.game_type_new);

-- Drop old enum and rename new
DROP TYPE public.game_type;
ALTER TYPE public.game_type_new RENAME TO game_type;
```

### Form State Management

The ServerStatusCard component will manage:
- `selectedGame` state to control which config form to show
- `serverConfig` object state to collect game-specific data
- Common fields: `serverName`, `discordUsername`, `description`

### Validation Flow

```text
User clicks Submit
       |
       v
Validate common fields
       |
       v
Validate game-specific fields based on selectedGame
       |
       v
Construct server_config JSON
       |
       v
Call createRequest with all data
       |
       v
Handle success/error
```

---

## Summary of Changes

1. **Database:** 3 new columns + unique constraint + enum update
2. **UI Cleanup:** Remove capacity card, update game lists
3. **Dynamic Form:** Conditional rendering based on game selection
4. **Validation:** Client-side validation for all fields
5. **One-Server Policy:** Frontend check + database constraint

