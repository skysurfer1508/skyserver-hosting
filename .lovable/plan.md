

# Add Manual Account Verification Toggle for Admins

## Overview
Add a clickable verification toggle in the Admin Users table, allowing admins to manually verify (or unverify) a user's account directly from the user management panel.

## Changes

### 1. `src/hooks/useAdminUsers.tsx`
- Add a `toggleVerification` function that updates `profiles.is_verified` for a given user (same pattern as `toggleBan`)
- Export it alongside existing functions

### 2. `src/components/admin/AdminUsers.tsx`
- Replace the static CheckCircle/XCircle verification icons in the "Verified" column with a clickable `Switch` toggle (same style as the Ban/Admin toggles)
- Wire it to `toggleVerification` with loading state and toast feedback
- Use `data-[state=checked]:bg-green-500` styling to indicate verified status

## Technical Details
- The RLS policy "Admins can update all profiles" already permits this update -- no database changes needed
- The `is_verified` column already exists on the `profiles` table
- Follows the exact same pattern as `toggleBan` for consistency

