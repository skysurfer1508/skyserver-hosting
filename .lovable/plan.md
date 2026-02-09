
# Plan: Add Request Details Modal for Admins

## Overview
Add a clickable row feature to the AdminRequests table that opens a detailed view modal, showing all information about a server request including game-specific configuration (version, edition, world size, etc.), description, timestamps, and status information.

## User Experience
- Admin clicks anywhere on a request row (except action buttons) to open a details modal
- The modal displays all request information in a clean, organized layout
- Game-specific configuration is rendered based on the game type (Minecraft shows edition/version/software, Terraria shows world size/difficulty, etc.)
- For rejected requests, the rejection reason is displayed
- For active requests, assigned credentials info is shown (IP address, panel URL - not the encrypted password)

## Implementation Details

### 1. Create New Component: `RequestDetailsModal.tsx`
**Location:** `src/components/admin/RequestDetailsModal.tsx`

This modal component will:
- Accept the selected request as a prop
- Display request information in organized sections:
  - **User Info**: Email, Discord username
  - **Server Info**: Server name, game type with icon
  - **Game Configuration**: Dynamic content based on game type
    - Minecraft: Edition, Software, Version, EULA status
    - Terraria: Software, World Size, Difficulty
    - Satisfactory: Branch
  - **Description**: User's project description (if provided)
  - **Status Details**: Current status badge, timestamps
  - **Rejection Reason**: Shown only for rejected requests
  - **Active Server Info**: Assigned IP, Panel URL (for approved requests)

### 2. Update `AdminRequests.tsx`
- Add state for the details modal: `detailsDialogOpen` and use existing `selectedRequest`
- Make table rows clickable with cursor pointer styling
- Add click handler that opens the details modal (avoiding action button clicks)
- Import and render the new `RequestDetailsModal` component
- Add visual indicator (e.g., `Eye` icon or hover effect) to hint clickability

### 3. Helper Functions for Config Display
Create type-safe helper functions to parse and display the `server_config` JSON:
- `formatMinecraftConfig()` - Edition (Java/Bedrock), Software (Vanilla/Paper/Fabric/Forge), Version
- `formatTerrariaConfig()` - Software, World Size, Difficulty
- `formatSatisfactoryConfig()` - Branch

---

## Technical Notes

### Data Available
The `server_requests` table contains:
- `description` - User's project description
- `server_config` - JSON with game-specific settings:
  - Minecraft: `{ edition, software, version, eula_accepted }`
  - Terraria: `{ software, world_size, difficulty }`
  - Satisfactory: `{ branch }`
- `rejection_reason` - Text explaining why request was rejected
- `assigned_ip` - Server IP (after approval)
- `panel_url` - Control panel URL (after approval)
- `created_at`, `updated_at` - Timestamps

### UI Styling
- Use existing `gaming-card` and `border-border/50` classes for consistency
- Use the existing game labels and icons from `gameLabels` object
- Match existing modal patterns (like RejectModal and ApproveDialog)

### Type Safety
- Parse `server_config` with proper TypeScript type guards
- Use existing `MinecraftConfig`, `TerrariaConfig`, `SatisfactoryConfig` interfaces
