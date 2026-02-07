

# Admin Panel Overhaul - Command Center Architecture

## Overview

This plan transforms the current Admin Panel into a professional 4-tab "Command Center" with enhanced management capabilities including user statistics, advanced request workflow with rejection reasons, user management, and organized settings.

---

## Database Changes Required

### 1. Add `rejection_reason` column to `server_requests` table
- **Column**: `rejection_reason` (text, nullable)
- **Purpose**: Store the admin's reason when rejecting a request

### 2. Add `is_banned` column to `profiles` table
- **Column**: `is_banned` (boolean, default false)
- **Purpose**: Track whether a user account is disabled

---

## New File Structure

```text
src/
  pages/
    Admin.tsx                    (Major refactor - tab structure)
  components/
    admin/
      AdminOverview.tsx          (NEW - Stats cards & KPIs)
      AdminRequests.tsx          (NEW - Enhanced request table)
      AdminUsers.tsx             (NEW - User management table)
      AdminSettings.tsx          (NEW - Organized settings)
      RejectModal.tsx            (NEW - Rejection reason dialog)
      StatCard.tsx               (NEW - Reusable stat card)
      SlotUsageChart.tsx         (NEW - Circular progress)
  hooks/
    useAdminUsers.tsx            (NEW - User management hook)
    useAdminRequests.tsx         (Update - add rejection with reason)
    useAdminStats.tsx            (NEW - Statistics aggregation)
```

---

## Tab-by-Tab Implementation

### Tab 1: Overview (New Feature)

**Visual Layout:**
- 4 stat cards in a responsive grid (2x2 on mobile, 4x1 on desktop)
- Each card shows: icon, label, value, and optional trend indicator

**Stat Cards:**
| Card | Data Source | Visual |
|------|-------------|--------|
| Total Users | `COUNT(*) FROM profiles` | Number with Users icon |
| Active Servers | `COUNT(*) FROM server_requests WHERE status='active'` | Number with Server icon |
| Pending Requests | `COUNT(*) FROM server_requests WHERE status='pending'` | Number with Clock icon |
| Slot Usage | Sum of all game limits used vs total | Circular progress bar |

**New Hook: `useAdminStats.tsx`**
```typescript
// Returns: totalUsers, activeServers, pendingRequests, 
//          totalSlotsUsed, totalSlotsMax, usagePercentage
```

---

### Tab 2: Requests (Enhanced Workflow)

**Table Columns:**
| User | Discord | Game | Server | Status | Date | Actions |

**Action Buttons:**
- **Approve** (green): Opens existing credential modal
- **Reject** (red): Opens new rejection reason modal
- **Delete** (gray): Removes the request

**Rejection Modal (`RejectModal.tsx`):**
- Title: "Reject Request"
- Textarea: "Please provide a reason for rejection..."
- Actions: Cancel, Confirm Rejection

**Database Update on Reject:**
```sql
UPDATE server_requests 
SET status = 'rejected', rejection_reason = '[admin input]'
WHERE id = '[request_id]'
```

**User Dashboard Update:**
When `status = 'rejected'` and `rejection_reason` exists, show:
```text
+-----------------------------------------------+
| [X] Request Rejected                          |
| Reason: "Your description was too short."    |
| Please submit a new request or contact us.    |
+-----------------------------------------------+
```

---

### Tab 3: Users (New Feature)

**Table Columns:**
| Email | Discord | Role | Joined | Actions |

**Getting Discord Username:**
- Join `profiles` with `server_requests` to get the user's discord_username from their most recent request

**Actions:**
| Action | Implementation |
|--------|----------------|
| Ban/Unban Toggle | Updates `profiles.is_banned` |
| Make Admin Toggle | Inserts/deletes from `user_roles` table |

**New Hook: `useAdminUsers.tsx`**
```typescript
// Functions: fetchUsers, banUser, unbanUser, promoteToAdmin, demoteFromAdmin
// Uses RLS: Only admins can view all profiles via existing policy
```

**Search Feature:**
- Filter by email (client-side for simplicity)

---

### Tab 4: Settings (Cleanup)

**Layout: Two Cards Side-by-Side**

**Card 1: Capacity Management**
- Minecraft slots slider + active toggle
- Terraria slots slider + active toggle  
- Satisfactory slots slider + active toggle
- Progress bars showing current usage
- Save button

**Card 2: System Announcements**
- Maintenance Mode toggle (with description)
- Global Alert Message textarea
- Save button

**Removed:**
- "Total Slots (Legacy)" input - no longer needed since we use per-game limits

---

## Technical Implementation Details

### Admin.tsx Refactor

**Structure:**
```tsx
<Layout>
  <Tabs defaultValue="overview">
    <TabsList>
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="requests">Requests</TabsTrigger>
      <TabsTrigger value="users">Users</TabsTrigger>
      <TabsTrigger value="settings">Settings</TabsTrigger>
    </TabsList>
    
    <TabsContent value="overview">
      <AdminOverview />
    </TabsContent>
    <TabsContent value="requests">
      <AdminRequests />
    </TabsContent>
    <TabsContent value="users">
      <AdminUsers />
    </TabsContent>
    <TabsContent value="settings">
      <AdminSettings />
    </TabsContent>
  </Tabs>
</Layout>
```

### ServerStatusCard.tsx Update

Add rejection reason display when `status === 'rejected'`:
```tsx
{request.status === 'rejected' && (
  <Alert variant="destructive">
    <AlertTitle>Request Rejected</AlertTitle>
    <AlertDescription>
      Reason: {request.rejection_reason || 'No reason provided'}
    </AlertDescription>
  </Alert>
)}
```

---

## Implementation Order

1. **Database Migration** - Add `rejection_reason` and `is_banned` columns
2. **Create useAdminStats hook** - Statistics aggregation
3. **Create useAdminUsers hook** - User management functions
4. **Update useAdminRequests hook** - Add rejection with reason
5. **Create admin component files:**
   - StatCard.tsx
   - SlotUsageChart.tsx (circular progress)
   - AdminOverview.tsx
   - AdminRequests.tsx
   - RejectModal.tsx
   - AdminUsers.tsx
   - AdminSettings.tsx
6. **Refactor Admin.tsx** - Tab structure with new components
7. **Update ServerStatusCard.tsx** - Show rejection reason
8. **Update useServerRequest.tsx** - Include rejection_reason in type

---

## RLS Considerations

The existing RLS policies are already configured correctly:
- Admins can view all profiles via `is_admin(auth.uid())`
- Admins can manage user_roles via `is_admin(auth.uid())`
- Admins can update/delete server_requests

No new RLS policies are required.

---

## Summary of Changes

| Type | Files |
|------|-------|
| Database | 1 migration (2 columns) |
| New Hooks | 2 (`useAdminStats`, `useAdminUsers`) |
| Updated Hooks | 2 (`useAdminRequests`, `useServerRequest`) |
| New Components | 7 admin components |
| Updated Components | 1 (`ServerStatusCard`) |
| Refactored Pages | 1 (`Admin.tsx`) |

