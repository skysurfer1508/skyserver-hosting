

## Fix: Enforce Email Verification Using Database Check

### Problem

The `ProtectedRoute` currently checks `session?.user?.email_confirmed_at` from the JWT token. Because auto-confirm is enabled (to suppress Supabase's default emails), this field is always populated for all users -- meaning the verification guard is bypassed entirely. This affects both new users and the 14 existing users who have `is_verified: false` in the database.

### Solution

Switch from trusting the JWT to querying the `profiles.is_verified` column directly from the database. This ensures all users -- including those who registered before today -- must verify their email before accessing the dashboard.

---

### Changes

**1. `src/hooks/useAuth.tsx` -- Add `isVerified` state from database**

- Add `isVerified` boolean state (default `false`)
- Add `checkVerificationStatus(userId)` helper that queries `profiles.is_verified`
- Call it alongside `checkAdminRole` in both `onAuthStateChange` and `getSession` callbacks
- Expose `isVerified` and a `refreshVerification` function in the context (so VerifyEmail page can trigger a re-check)

**2. `src/components/ProtectedRoute.tsx` -- Use `isVerified` instead of JWT**

- Pull `isVerified` from `useAuth()` context
- Replace `!session?.user?.email_confirmed_at` check with `!isVerified`

**3. `src/pages/VerifyEmail.tsx` -- Refresh verification after success**

- After successful `verifyOtp()`, call `refreshVerification()` from the auth context so the user can proceed to the dashboard without a full page reload

**4. `supabase/functions/send-auth-email/index.ts` -- Safety net for existing users**

- After nullifying `email_confirmed_at` for signup, also explicitly update `profiles.is_verified = false` to guarantee consistency

---

### Impact on Existing Users

There are 14 users with `is_verified: false` in the database. After this change, when they next visit the dashboard they will see the Email Verification Guard screen, where they can click "Resend Verification Email" to get a verification link from `noreply@skyserver1508.org`. Once verified, they regain full access.

### Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useAuth.tsx` | Add `isVerified` state + `refreshVerification` backed by `profiles.is_verified` |
| `src/components/ProtectedRoute.tsx` | Use `isVerified` instead of `session.user.email_confirmed_at` |
| `src/pages/VerifyEmail.tsx` | Call `refreshVerification()` after successful OTP verify |
| `supabase/functions/send-auth-email/index.ts` | Also set `profiles.is_verified = false` for signups |

