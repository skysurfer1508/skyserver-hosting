

## Email Verification & Password Reset System

This plan implements a strict email verification gatekeeper, a password reset flow, and an admin tool to force re-verification of all existing users.

---

### Prerequisites

Your `RESEND_API_KEY` is already saved in the project secrets -- no additional setup needed there.

However, we need to configure the backend authentication system to send emails through Resend (your custom domain `skyserver1508.org`) instead of the default email provider. This requires creating a backend function to handle custom auth emails.

---

### What Will Be Built

**1. Custom Auth Email Edge Function**
- A new backend function `send-auth-email` that uses Resend to send verification and password reset emails from `noreply@skyserver1508.org`.
- Handles both `signup` (verification) and `recovery` (password reset) email types.
- Uses your custom domain redirect URLs.

**2. Email Verification Guard Component**
- A new `EmailVerificationGuard` component that wraps the dashboard.
- Checks `session.user.email_confirmed_at` -- if `null`, blocks dashboard access.
- Shows a full-screen "Verification Required" page with:
  - An envelope icon and clear messaging
  - The user's email address displayed
  - A "Resend Verification Email" button that calls `supabase.auth.resend()` with `emailRedirectTo: 'https://www.skyserver1508.org/dashboard'`
  - A "Sign Out" option
- Integrated into the `ProtectedRoute` component so it gates both `/dashboard` and `/admin`.

**3. Password Reset Flow (Two New Pages)**
- `/auth/forgot-password` -- A form where users enter their email. Calls `supabase.auth.resetPasswordForEmail()` with `redirectTo: 'https://www.skyserver1508.org/auth/update-password'`. Shows a success confirmation after submission.
- `/auth/update-password` -- The landing page after clicking the reset link. Detects the recovery session from the URL token, then presents a new password form. Calls `supabase.auth.updateUser({ password })`.
- A "Forgot Password?" link added to the Login page.

**4. Admin: Force Re-Verification Function**
- A new backend function `reset-all-verification` that sets `email_confirmed_at = NULL` for all non-admin users in `auth.users`.
- Uses the service role key to modify the auth schema (cannot be done from the frontend directly).
- A one-time-use button added to the Admin Settings tab, with a confirmation dialog to prevent accidental clicks.

**5. Registration Flow Update**
- After successful signup, redirect to a "Check Your Email" confirmation page instead of directly to `/dashboard`.
- Update the success toast message to say "Please check your email to verify your account."

---

### Technical Details

#### Files to Create
| File | Purpose |
|------|---------|
| `supabase/functions/send-auth-email/index.ts` | Resend-powered auth email sender |
| `supabase/functions/reset-all-verification/index.ts` | Admin RPC to clear all email_confirmed_at |
| `src/components/EmailVerificationGuard.tsx` | Gatekeeper blocking unverified users |
| `src/pages/ForgotPassword.tsx` | Password reset request page |
| `src/pages/UpdatePassword.tsx` | New password entry page |

#### Files to Modify
| File | Change |
|------|--------|
| `src/components/ProtectedRoute.tsx` | Add `EmailVerificationGuard` check after auth check |
| `src/pages/Login.tsx` | Add "Forgot Password?" link |
| `src/pages/Register.tsx` | Change post-signup behavior to show verification message |
| `src/App.tsx` | Add routes for `/auth/forgot-password` and `/auth/update-password` |
| `src/components/admin/AdminSettings.tsx` | Add "Force Re-Verification" button |
| `supabase/config.toml` | Register the new edge functions |

#### Auth Email Flow
```text
User Signs Up
  --> Supabase sends default confirmation email
  --> User can also click "Resend" which calls supabase.auth.resend()
  --> Redirect URL: https://www.skyserver1508.org/dashboard

User Requests Password Reset
  --> Frontend calls supabase.auth.resetPasswordForEmail()
  --> Redirect URL: https://www.skyserver1508.org/auth/update-password
  --> User clicks link, lands on UpdatePassword page
  --> Submits new password via supabase.auth.updateUser()
```

#### Email Verification Guard Logic
```text
User logs in
  --> ProtectedRoute checks: authenticated? 
    --> No: redirect to /login
    --> Yes: check email_confirmed_at
      --> NULL: show EmailVerificationGuard screen (blocked)
      --> Set: render dashboard normally
```

#### Force Re-Verification (Admin)
```text
Admin clicks "Force Re-Verification" in Settings
  --> Confirmation dialog appears
  --> On confirm, calls reset-all-verification edge function
  --> Edge function uses service role to UPDATE auth.users SET email_confirmed_at = NULL WHERE id NOT IN (admin ids)
  --> All non-admin users must re-verify on next login
```

