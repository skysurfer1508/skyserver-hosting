

# Add "Reactivate Expired Server" Option for Admins

## Overview
Give admins a button to reactivate servers that were automatically expired by the cleanup process. This sets the server back to "active" status with a fresh 7-day lease, clearing the rejection reason.

## Changes

### 1. `src/hooks/useAdminRequests.tsx`
- Add a `reactivateRequest` function that updates the server request:
  - Sets `status` back to `'active'`
  - Sets `expires_at` to `now() + 7 days` (using `new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()`)
  - Clears `rejection_reason` to `null`
- Export it alongside existing functions

### 2. `src/components/admin/AdminRequests.tsx`
- Add a "Reactivate" button in the Actions column for rejected requests where `rejection_reason === 'Server lease expired automatically.'`
- The button uses a `RotateCcw` icon (from lucide-react) with success-colored styling
- Wire it to call `reactivateRequest` with loading state and toast feedback
- Add a confirmation dialog (AlertDialog) before reactivating, showing the server name and confirming the action

### 3. Status Badge Enhancement
- For expired servers specifically (rejected + expired reason), show an "Expired" badge with a Clock icon and warning styling instead of the generic red "Rejected" badge, so admins can quickly identify which servers need reactivation vs. were manually rejected

## Technical Details
- The existing RLS policy "Admins can update all requests" already permits this update -- no database changes needed
- The reactivation simply reverses what the `cleanup-expired-servers` edge function does
- Credentials remain encrypted in the database, so they are preserved and the user regains access immediately

