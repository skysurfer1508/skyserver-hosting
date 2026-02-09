
# Email Verification Enforcement Implementation

This plan enforces email verification for all users (including existing ones) and adds verification status visibility in the Admin Panel.

## Overview

**What this does:**
- Blocks unverified users from accessing the dashboard with a "Verification Required" screen
- Provides options to resend verification email or update email address (for typos)
- Shows email verification status for all users in the Admin Panel

---

## Implementation Components

### 1. Email Verification Check Hook

**New File:** `src/hooks/useEmailVerification.tsx`

A custom hook that checks if the current user's email is verified by reading the `email_confirmed_at` field from the Supabase auth user object.

```text
useEmailVerification()
  - isEmailVerified: boolean
  - isChecking: boolean
  - userEmail: string | null
  - resendVerificationEmail(): Promise
  - updateEmail(newEmail): Promise
```

### 2. Verification Required Modal Component

**New File:** `src/components/dashboard/EmailVerificationModal.tsx`

A blocking modal (similar to ProfileCompletionModal) that displays when the user's email is not verified.

**Features:**
- Clear message explaining verification is required
- "Resend Verification Email" button
- Input field + "Update Email" button for correcting typos
- Cannot be dismissed until email is verified

### 3. Dashboard Integration

**Modified File:** `src/pages/Dashboard.tsx`

Add the email verification check to the Dashboard. The verification modal will block access until the user verifies their email.

**Flow:**
1. Check if user's `email_confirmed_at` is null
2. If null, show EmailVerificationModal (blocks dashboard content)
3. After verification, user can access dashboard normally

### 4. Admin Panel: User Verification Status

**Modified Files:**
- `src/hooks/useAdminUsers.tsx` - Add `is_verified` field
- `src/components/admin/AdminUsers.tsx` - Add verification status column

**Approach (Edge Function method):**
Since `auth.users` cannot be accessed directly from the client, we'll create an Edge Function that uses the service role to fetch `email_confirmed_at` status for all users.

**New Edge Function:** `supabase/functions/get-users-verification-status/index.ts`

This function will:
- Accept a list of user IDs
- Query `auth.users` using service role
- Return verification status for each user

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/hooks/useEmailVerification.tsx` | Create | Hook to check verification status and handle resend/update email |
| `src/components/dashboard/EmailVerificationModal.tsx` | Create | Blocking modal for unverified users |
| `src/pages/Dashboard.tsx` | Update | Add verification check and modal |
| `supabase/functions/get-users-verification-status/index.ts` | Create | Fetch verification status from auth.users |
| `supabase/config.toml` | Update | Register new edge function |
| `src/hooks/useAdminUsers.tsx` | Update | Fetch and include verification status |
| `src/components/admin/AdminUsers.tsx` | Update | Display verification status column |

---

## User Experience

### For Regular Users (Unverified)

```text
User logs in
     |
     v
Dashboard attempts to load
     |
     v
[Verification check runs]
     |
     +-- email_confirmed_at is NULL?
     |        |
     |        v
     |   Show "Verification Required" Modal
     |        |
     |        +-- [Resend Verification Email] button
     |        |        calls supabase.auth.resend()
     |        |
     |        +-- [Update Email] input + button
     |                 calls supabase.auth.updateUser()
     |
     +-- email_confirmed_at exists?
              |
              v
         Show Dashboard normally
```

### For Admins

The Users table will show a new "Verified" column with:
- Green checkmark icon for verified users
- Yellow/orange warning icon for unverified users

---

## Technical Details

### Email Verification Modal Features

**Resend Verification Email:**
```typescript
// Uses Supabase's built-in resend method
await supabase.auth.resend({ 
  type: 'signup', 
  email: user.email 
});
```

**Update Email (for typos):**
```typescript
// Sends confirmation to new email
await supabase.auth.updateUser({ 
  email: newEmail 
});
```

### Admin Verification Status Edge Function

```typescript
// Uses service role to access auth.users
const { data: authUsers } = await supabase.auth.admin.listUsers();
// Returns map of user_id -> is_verified boolean
```

---

## Why This Approach?

1. **No Database Migration Needed:** We read `email_confirmed_at` directly from the auth user object instead of syncing to profiles table (simpler, less maintenance)

2. **Edge Function for Admin:** Since `auth.users` is protected, we use an Edge Function with service role access to fetch verification status for the admin panel

3. **Consistent Pattern:** The EmailVerificationModal follows the same pattern as the existing ProfileCompletionModal for familiarity

4. **Self-Service:** Users can resend verification or fix email typos without contacting support
