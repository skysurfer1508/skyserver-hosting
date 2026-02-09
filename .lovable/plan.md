

# Fix: Send Custom Verification Email on Signup

## Problem

When a user creates an account, the verification email link points to the wrong domain. This happens because:

1. Supabase's built-in signup flow sends its own confirmation email
2. That email uses Supabase's internal email template and site URL settings
3. Even though `emailRedirectTo` is set to `https://www.skyserver1508.org`, the email template may still use a different domain

The custom `send-verification-email` edge function is currently only used for **resending** verification emails (from the blocked screen), not during initial signup.

---

## Solution

Call the custom `send-verification-email` edge function immediately after a successful signup to send a branded verification email with the correct URL pointing to `www.skyserver1508.org`.

---

## Changes Required

### 1. Update Register.tsx - Send Custom Verification Email After Signup

**File:** `src/pages/Register.tsx`

After a successful signup, invoke the custom edge function to send the verification email:

```typescript
import { supabase } from '@/integrations/supabase/client';
import { PRODUCTION_URL } from '@/config/constants';

// After successful signUp:
const { error } = await signUp(email, password, { full_name: fullName.trim() });

if (!error) {
  // Send custom verification email with correct URL
  await supabase.functions.invoke('send-verification-email', {
    body: {
      email: email,
      verificationUrl: `${PRODUCTION_URL}/verify-email`,
      userName: fullName.trim(),
    },
  });
  
  // Show success message and redirect
  toast({
    title: 'Account created!',
    description: 'Please check your email to verify your account.',
  });
  navigate('/verify-email'); // Redirect to verification pending page
}
```

---

### 2. Update Success Message

Change the toast message to inform users they need to verify their email before accessing the dashboard.

---

### 3. Redirect to Verify Email Page

Instead of redirecting to `/dashboard` (where they'll be blocked anyway), redirect to `/verify-email` which shows the "Check Your Email" message.

---

## Summary

| File | Change |
|------|--------|
| `src/pages/Register.tsx` | Add custom verification email call after signup |
| `src/pages/Register.tsx` | Update success message to mention email verification |
| `src/pages/Register.tsx` | Redirect to `/verify-email` instead of `/dashboard` |

---

## How It Works

```text
User Signs Up
    │
    ▼
supabase.auth.signUp() called
    │
    ▼
Custom send-verification-email edge function called
    │
    ▼
User receives branded email with link to:
https://www.skyserver1508.org/verify-email
    │
    ▼
User clicks link → lands on custom domain → verifies email
```

---

## Result

After this fix:
- New users receive a verification email with the correct link to `www.skyserver1508.org`
- The email uses the branded SkyServer template
- Users are redirected to the verification pending page instead of being blocked at the dashboard

