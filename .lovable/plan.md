
# Fix: Email Verification and Password Reset Redirecting to Custom Domain

## Problem

When users click email verification or password reset links, they are redirected to the Lovable preview domain (`*.lovable.app`) instead of your custom domain (`www.skyserver1508.org`).

This happens because `window.location.origin` is evaluated at runtime, and when running in the Lovable preview environment, it captures the preview URL instead of your production domain.

## Solution

Hardcode the production domain URL and use it for all authentication-related email redirects:

1. Add a `PRODUCTION_URL` constant to the config
2. Update the signup flow to use this URL for email verification redirects
3. Ensure the password reset flow consistently uses the custom domain
4. Update the resend verification flow in `RequireVerification` to also use the custom URL

---

## Implementation Details

### 1. Add Production URL Constant

**File:** `src/config/constants.ts`

Add a new constant for the production URL:

```typescript
export const PRODUCTION_URL = 'https://www.skyserver1508.org';
```

This ensures all email redirects point to your custom domain regardless of where the code runs.

---

### 2. Update useAuth.tsx - Signup Redirect

**File:** `src/hooks/useAuth.tsx`

Change the `emailRedirectTo` in the `signUp` function from `window.location.origin` to the hardcoded production URL:

```typescript
import { PRODUCTION_URL } from '@/config/constants';

// In signUp function:
emailRedirectTo: `${PRODUCTION_URL}/verify-email`,
```

---

### 3. Update RequireVerification.tsx - Resend Verification

**File:** `src/components/auth/RequireVerification.tsx`

The `supabase.auth.resend()` function uses Supabase's built-in emails, which may also redirect incorrectly. We have two options:

**Option A (Recommended):** Use the custom `send-verification-email` edge function instead of Supabase's built-in resend. This gives full control over the email content and redirect URL.

**Option B:** Continue using `supabase.auth.resend()` but ensure the signup `emailRedirectTo` is correctly set (which we're fixing in step 2).

I recommend Option A for consistency. The change:

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

### 4. Update VerifyEmail.tsx - Handle Redirect Properly

**File:** `src/pages/VerifyEmail.tsx`

The VerifyEmail page should handle the Supabase confirmation token and process verification. Since Supabase's email confirmation links include a token hash fragment, ensure the page can process both custom verification flows and Supabase's built-in flow.

No code changes needed here if we continue using Supabase's built-in verification mechanism - just ensure the redirect URL points to the custom domain.

---

### 5. Password Reset Already Works

**File:** `src/pages/ForgotPassword.tsx`

The password reset already uses `window.location.origin` which works correctly when accessed from the production domain. However, to ensure consistency:

```typescript
import { PRODUCTION_URL } from '@/config/constants';

const resetUrl = `${PRODUCTION_URL}/reset-password`;
```

---

## File Changes Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `src/config/constants.ts` | Add | Add `PRODUCTION_URL` constant |
| `src/hooks/useAuth.tsx` | Update | Use `PRODUCTION_URL` for signup redirect |
| `src/components/auth/RequireVerification.tsx` | Update | Use custom edge function with `PRODUCTION_URL` |
| `src/pages/ForgotPassword.tsx` | Update | Use `PRODUCTION_URL` for reset redirect |

---

## Why This Works

By hardcoding `https://www.skyserver1508.org`:

1. **Signup emails** will contain verification links pointing to your custom domain
2. **Password reset emails** will link to your custom domain
3. **Resend verification emails** will also use your custom domain
4. **No dependency on runtime `window.location.origin`** which varies by environment

---

## Important Note

The Supabase project settings should also have the custom domain configured as the Site URL. However, since you're using Lovable Cloud, you don't have direct access to the Supabase dashboard. The code-level fix above ensures the correct URLs are used regardless of Supabase settings.
