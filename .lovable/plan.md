

# Fix: Email Redirects to Custom Domain (www.skyserver1508.org)

## Problem

When users click email verification or password reset links, they are redirected to the Lovable preview domain instead of your custom domain `www.skyserver1508.org`.

This happens because `window.location.origin` captures the current runtime environment, which varies between preview and production.

---

## Solution Overview

Hardcode the production URL in a central constant and use it for all authentication-related email redirects:

1. Add `PRODUCTION_URL` constant
2. Update signup flow redirect
3. Update verification resend to use custom edge function with correct URL
4. Update password reset redirect

---

## File Changes

### 1. Add Production URL Constant

**File:** `src/config/constants.ts`

```typescript
// Add new constant
export const PRODUCTION_URL = 'https://www.skyserver1508.org';
```

---

### 2. Update Signup Redirect

**File:** `src/hooks/useAuth.tsx`

Change the `emailRedirectTo` in the signup function:

```typescript
import { PRODUCTION_URL } from '@/config/constants';

// In signUp function, change:
emailRedirectTo: window.location.origin,
// To:
emailRedirectTo: PRODUCTION_URL,
```

---

### 3. Update Resend Verification Flow

**File:** `src/components/auth/RequireVerification.tsx`

Replace the Supabase built-in `resend()` with the custom edge function that already supports your domain branding:

```typescript
import { PRODUCTION_URL } from '@/config/constants';

// Replace supabase.auth.resend() with:
const { error } = await supabase.functions.invoke('send-verification-email', {
  body: {
    email: user.email,
    verificationUrl: `${PRODUCTION_URL}/verify-email`,
    userName: user.user_metadata?.full_name,
  },
});
```

---

### 4. Update Password Reset Redirect

**File:** `src/pages/ForgotPassword.tsx`

```typescript
import { PRODUCTION_URL } from '@/config/constants';

// Change:
const resetUrl = `${window.location.origin}/reset-password`;
// To:
const resetUrl = `${PRODUCTION_URL}/reset-password`;
```

---

## Summary

| File | Change |
|------|--------|
| `src/config/constants.ts` | Add `PRODUCTION_URL` constant |
| `src/hooks/useAuth.tsx` | Use `PRODUCTION_URL` for signup redirect |
| `src/components/auth/RequireVerification.tsx` | Use custom edge function with correct URL |
| `src/pages/ForgotPassword.tsx` | Use `PRODUCTION_URL` for password reset |

---

## Result

After these changes:
- Verification emails link to `https://www.skyserver1508.org/verify-email`
- Password reset emails link to `https://www.skyserver1508.org/reset-password`
- All auth flows work correctly on your custom domain

